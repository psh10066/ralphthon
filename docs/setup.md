# 프로젝트 세팅 & 배포

## 기술 스택
- **Runtime**: Next.js 14 (App Router), TypeScript, React 18
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`)
- **DB**: Supabase (PostgreSQL + REST API)
- **배포**: Vercel
- **Discord**: HTTP Interactions (슬래시 커맨드 + 버튼)
- **Telegram**: REST API
- **AI**: Anthropic Claude API

## 환경변수 (.env)

```
# Discord Bot
DISCORD_BOT_TOKEN=       # Discord Developer Portal > Bot > Token
DISCORD_PUBLIC_KEY=      # Discord Developer Portal > General Information > Public Key
DISCORD_GUILD_ID=        # 봇이 참여한 서버 ID
DISCORD_CHANNEL_ID=      # 메시지를 보낼 채널 ID

# Anthropic
ANTHROPIC_API_KEY=       # console.anthropic.com

# GitHub
GITHUB_TOKEN=            # github.com/settings/tokens (repo scope)

# Telegram
TELEGRAM_BOT_TOKEN=      # @BotFather > /newbot
TELEGRAM_CHAT_ID=        # 봇에게 메시지 보낸 후 getUpdates API로 확인

# Supabase
SUPABASE_URL=            # https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=       # JWT 형식 anon key (Settings > API)
DATABASE_URL=            # Session Pooler URI (IPv4 호환)
SUPABASE_PROJECT_REF=    # 프로젝트 ref (URL에서 확인: supabase.co/dashboard/project/<ref>)
SUPABASE_MANAGEMENT_TOKEN= # Management API 토큰 (supabase.com/dashboard/account/tokens)

# Client-side (NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_DISCORD_CHANNEL_ID=
NEXT_PUBLIC_TELEGRAM_CHAT_ID=
```

## 프로젝트 초기화 순서

```bash
# 1. Next.js 프로젝트 생성
npx create-next-app@latest . --typescript --tailwind --app --src-dir

# 2. 의존성 설치
npm install @supabase/supabase-js @anthropic-ai/sdk tweetnacl pg
echo "legacy-peer-deps=true" > .npmrc

# 3. .env 복사 (ralphthon 폴더에서)
# 4. lib/ 코드 작성 (api-reference.md 참고)
# 5. 빌드 + 배포
npm run build && vercel --prod --yes

# 6. Discord 연동 자동 설정
curl -X POST https://배포URL/api/discord/register

# 7. Supabase 스키마 초기화 (pg 클라이언트로 자동)
```

## 프로젝트 구조 (권장)

```
src/
  app/
    layout.tsx, page.tsx, globals.css
    api/
      discord/
        interactions/route.ts   # 슬래시 커맨드 + 버튼 핸들러
        register/route.ts       # 커맨드 등록 + Endpoint URL 자동 설정
      ... (기능별 API Route)
  lib/
    anthropic.ts                # Claude API 클라이언트
    discord.ts                  # Discord REST API (메시지 전송)
    discord-interactions.ts     # Discord Interactions (서명 검증, 커맨드 등록)
    github.ts                   # GitHub REST API
    supabase.ts                 # Supabase 클라이언트
    telegram.ts                 # Telegram REST API
```

## 배포 (Vercel)

### 최초 배포
```bash
vercel login
vercel --yes                    # preview 배포
vercel env add KEY production <<< "값"   # 환경변수 설정 (각 키 반복)
vercel --prod --yes             # 프로덕션 배포
```

### 배포 후 Discord 연동 자동 설정
```bash
curl -X POST https://배포URL/api/discord/register
```
이 한 줄로 Interactions Endpoint URL + 슬래시 커맨드가 자동 등록됨.

### 재배포
```bash
vercel --prod --yes
```

### 주의사항
- `.npmrc`에 `legacy-peer-deps=true` 필수
- `NEXT_PUBLIC_` 변수는 빌드 타임에 번들에 포함. 변경 시 재배포 필요
