# 외부 API 연동 레퍼런스

## Discord REST API (메시지 전송)
- **메시지 전송**: `POST https://discord.com/api/v10/channels/{channelId}/messages`
  - Header: `Authorization: Bot {DISCORD_BOT_TOKEN}`
  - Body: `{ "content": "메시지" }`
- **서버 채널 목록**: `GET https://discord.com/api/v10/guilds/{guildId}/channels`
- **코드**: `src/lib/discord.ts`
- **API Route**: `POST /api/notifications/discord` — `{ channelId, message }`

## Discord Interactions (슬래시 커맨드 + 버튼)
- **방식**: HTTP Interactions (Gateway 아님 → Vercel 서버리스에서 동작)
- **서명 검증**: `tweetnacl` 라이브러리로 `DISCORD_PUBLIC_KEY` 검증
- **자동 설정**: `POST /api/discord/register` 호출 1번이면:
  1. Interactions Endpoint URL 자동 설정 (현재 배포 URL 자동 감지)
  2. 슬래시 커맨드 등록 (`/ask`, `/status`, `/ping`)
  - 사람이 Discord Developer Portal을 만질 필요 없음
- **새 프로젝트 배포 후**: `curl -X POST https://새URL/api/discord/register` 실행하면 끝
- **코드**: `src/lib/discord-interactions.ts`, `src/app/api/discord/interactions/route.ts`

### 슬래시 커맨드 추가 방법
`src/lib/discord-interactions.ts`의 `registerSlashCommands()` 함수에 커맨드 추가:
```typescript
{ name: "새커맨드", description: "설명", options: [{ name: "param", type: 3, required: true }] }
```
`src/app/api/discord/interactions/route.ts`에 핸들러 추가:
```typescript
if (name === "새커맨드") {
  return NextResponse.json({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: "응답 텍스트",
      components: [{ type: ComponentType.ACTION_ROW, components: [버튼들] }],
    },
  });
}
```

### 버튼/컴포넌트
- `ComponentType.BUTTON` — 클릭 버튼
- `ComponentType.STRING_SELECT` — 드롭다운 선택
- `ButtonStyle.PRIMARY` (파랑), `SECONDARY` (회색), `SUCCESS` (초록), `DANGER` (빨강)
- 버튼 클릭 시 `InteractionType.MESSAGE_COMPONENT`로 이벤트 수신
- `custom_id`로 어떤 버튼인지 구분

## Telegram REST API
- **메시지 전송**: `POST https://api.telegram.org/bot{TOKEN}/sendMessage`
  - Body: `{ "chat_id": "...", "text": "...", "parse_mode": "Markdown" }`
- **Chat ID 얻기**: 봇에게 메시지 보낸 후 `GET /getUpdates`로 `chat.id` 확인
- **코드**: `src/lib/telegram.ts`
- **API Route**: `POST /api/notifications/telegram` — `{ chatId, message }`

## Anthropic Claude API
- **라이브러리**: `@anthropic-ai/sdk`
- **코드**: `src/lib/anthropic.ts`
- **API Route**: `POST /api/chat` — `{ message }` → `{ reply }`

## GitHub API
- **인증**: `Authorization: Bearer {GITHUB_TOKEN}`
- **코드**: `src/lib/github.ts`
- **API Route**: `GET /api/github` → `{ user, repos }`

## Supabase
- **라이브러리**: `@supabase/supabase-js` (REST API용), `pg` (직접 SQL용)
- **REST API**: `supabase.from("table").insert(...)` / `.select("*")`
- **직접 SQL** (테이블 생성 등): `pg` 클라이언트로 `DATABASE_URL` 사용
  - **주의**: Direct connection은 IPv6 전용. 반드시 **Session Pooler** 사용
  - **주의**: 비밀번호에 `@`, `#` 특수문자 있으면 개별 파라미터로 연결
- **코드**: `src/lib/supabase.ts`

### Supabase Management API (배포 자동화)
- **용도**: Vercel 배포 시 Supabase Auth 설정 (site_url, redirect URL 등) 자동화
- **토큰**: `SUPABASE_MANAGEMENT_TOKEN` (https://supabase.com/dashboard/account/tokens 에서 발급)
- **배포 후 Auth 설정 자동화**:
  ```bash
  curl -X PATCH "https://api.supabase.com/v1/projects/{SUPABASE_PROJECT_REF}/config/auth" \
    -H "Authorization: Bearer {SUPABASE_MANAGEMENT_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
      "site_url": "https://배포URL",
      "uri_allow_list": "https://배포URL/**"
    }'
  ```
- Supabase Auth (Google/GitHub 로그인 등) 사용 시 배포할 때마다 이 curl 한 줄로 redirect URL 설정 완료

### Supabase 커스텀 스키마 (기존 테이블과 분리)
- **public 스키마에 기존 앱 테이블이 있으므로**, 새 프로젝트는 커스텀 스키마를 사용
- `pg` 클라이언트로 초기화 (DATABASE_URL 사용):
  ```sql
  -- 1. 스키마 생성
  CREATE SCHEMA IF NOT EXISTS {앱이름};

  -- 2. REST API (supabase-js) 접근 권한 부여
  GRANT USAGE ON SCHEMA {앱이름} TO anon, authenticated;
  GRANT ALL ON ALL TABLES IN SCHEMA {앱이름} TO anon, authenticated;
  ALTER DEFAULT PRIVILEGES IN SCHEMA {앱이름} GRANT ALL ON TABLES TO anon, authenticated;

  -- 3. 테이블 생성
  CREATE TABLE {앱이름}.my_table (...);
  ```
- **supabase-js에서 커스텀 스키마 사용**:
  ```typescript
  const supabase = createClient(url, key, { db: { schema: '앱이름' } });
  ```
- **Data API에 스키마 노출** (Management API로 자동화):
  ```bash
  curl -X PATCH "https://api.supabase.com/v1/projects/{SUPABASE_PROJECT_REF}/config/postgrest" \
    -H "Authorization: Bearer {SUPABASE_MANAGEMENT_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"db_schema":"public,{앱이름}"}'
  ```
- **정리**: 해커톤 끝나면 `DROP SCHEMA {앱이름} CASCADE;`로 통째로 삭제

### DB 스키마 예시
```sql
-- 메시지/활동 로그 테이블 (참고용)
create table if not exists {스키마}.messages (
  id bigint generated always as identity primary key,
  type text not null,
  user_message text,
  ai_response text,
  metadata jsonb,
  created_at timestamptz default now()
);
alter table {스키마}.messages enable row level security;
create policy allow_all on {스키마}.messages for all using (true) with check (true);
```

## Instagram API (자기 계정만, 앱 심사 불필요)
- 사전 준비: 인스타 계정을 **크리에이터/비즈니스**로 전환 (1분)
- Meta Developer Portal에서 앱 생성 → Instagram 제품 추가
- 스코프: `instagram_business_basic`, `instagram_business_content_publish`
- 가능: 내 프로필/포스트 읽기, 포스트 발행 (100개/일), 스토리, 댓글 관리
- 불가: 다른 유저 데이터, 해시태그 검색 (앱 심사 필요)
