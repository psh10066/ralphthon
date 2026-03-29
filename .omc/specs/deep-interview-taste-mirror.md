# Deep Interview Spec: 취향 거울 (Taste Mirror)

## Metadata
- Interview ID: ralphton-v3-taste-mirror
- Rounds: 12
- Final Ambiguity Score: 29%
- Type: greenfield
- Generated: 2026-03-29
- Threshold: 20%
- Status: BELOW_THRESHOLD_EARLY_EXIT (사용자 요청으로 조기 종료 — 추가 기획 문서 대기)

## Clarity Breakdown
| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Goal Clarity | 0.82 | 0.40 | 0.328 |
| Constraint Clarity | 0.68 | 0.30 | 0.204 |
| Success Criteria | 0.60 | 0.30 | 0.180 |
| **Total Clarity** | | | **0.712** |
| **Ambiguity** | | | **29%** |

## Goal
사진 5장에서 취향 에센스를 6축(양감/질감/투명도/촉각/무게/온도)으로 분석하고, 메타대화를 통해 자기 이해의 언어로 돌려주는 멀티채널 서비스. 웹, 텔레그램, 디스코드 3채널에서 동등한 전체 경험을 제공한다.

핵심 가설: 사람들은 자기가 뭘 좋아하는지는 알지만, 왜 좋아하는지는 모른다. 끌리는 사진의 교집합을 6축으로 읽으면 "이게 나야?" 순간이 온다.

## Constraints
- **Tech Stack**: Next.js 14 + TypeScript + Tailwind CSS, Claude API (Vision + Text), Supabase, Vercel
- **멀티채널**: 웹 (3페이지) + 텔레그램 봇 + 디스코드 봇 — 모든 채널 동등
- **구현 순서**: 웹 먼저 → 텔레그램 → 디스코드
- **데이터 저장**: Supabase (PRD의 localStorage 대신)
- **인증**: Lazy Auth — 익명 시작, 저장 시 로그인 유도
- **프로젝트 맥락**: 해커톤 시연용. 평가 기준 = "ralph로 얼마나 큰 서비스를 잘 만들었나"
- **스코프**: PRD v3의 모든 기능 완전 구현. 스코프 축소 없음
- **기존 docs**: setup.md, api-reference.md는 사용 가능한 도구/인프라 목록. PRD v3가 구현 대상
- **디자인 톤**: 투명, 유리, 여백, 거울. 군더더기 없음. 콘텐츠가 장식

## Non-Goals
- UI 테마 동적 생성 (v2에서 제거됨)
- 카카오 공유
- 예시 에센스 카드

## Acceptance Criteria

### 웹 (3페이지)
- [ ] 랜딩(`/`): 호기심 카피("사진 5장이면 당신이 보입니다") + '시작하기' 버튼. 흰 배경, 큰 세리프, 여백
- [ ] 업로드: 사진 5장 업로드. 5장 채워야 '나를 읽어줘' 활성화. 투명한 유리 오버레이
- [ ] 로딩: "당신을 읽고 있어요..." + 프로그레스 바. 10~15초 예상
- [ ] 에센스 결과: 헤드라인(32px+, 세리프) + 6축 설명 + 컬러팔레트(사진에서 추출 5색) + 가설 질문
- [ ] 가설 질문 3-way 반응: "맞아/아닌데/모르겠어" 각각 Supabase에 저장 + 다음 흐름 분기
- [ ] /chat 메타대화: URL 크롤링(서버 사이드) + 텍스트 직접 입력 모두 가능
- [ ] /chat 대화 흐름: "이 글에서 뭐가 걸렸어요?"로 시작, 에센스와 자연스럽게 연결
- [ ] /chat 인사이트: AI 자동 감지 시 카드로 저장 제안 + 사용자 수동 저장도 가능
- [ ] /profile: 에센스 요약 + 6축 프로그레스 바 + 축적된 인사이트 목록 + 반복 키워드
- [ ] Lazy Auth: 익명 세션 UUID로 시작, 저장 필요 시 Supabase Auth 로그인 유도
- [ ] 모바일 반응형 (390px 뷰포트)

### 텔레그램 봇
- [ ] 사진 5장 전송 → 에센스 텍스트 응답 (헤드라인 + 6축 + 가설 질문)
- [ ] URL/텍스트 전송 → 메타대화 진행 (채팅 플로우)
- [ ] /profile 명령어 → 프로필 텍스트 응답 (에센스 + 인사이트 목록)
- [ ] 인사이트 감지 시 텍스트로 저장 제안

### 디스코드 봇
- [ ] 텔레그램과 동일한 전체 플로우

### 공통
- [ ] Supabase에 모든 데이터 영구 저장 (에센스, 대화, 인사이트, 프로필)
- [ ] URL 크롤링: 가능/불가능 케이스 정의 및 graceful fallback
- [ ] 공유 백엔드: analyze/chat/profile 서비스를 3채널이 공유

## Assumptions Exposed & Resolved
| Assumption | Challenge | Resolution |
|------------|-----------|------------|
| 기존 docs가 PRD v3와 같은 프로젝트 | "어느 쪽을 만드나?" | PRD v3가 타겟. 기존 docs는 도구 목록 |
| localStorage로 충분 (해커톤용) | "Supabase가 이미 구성됨" | Supabase 사용으로 변경 |
| 해커톤이라 MVP만 | "평가 기준이 뭔가?" | ralph 역량 시연 = 모든 기능 완전 구현 |
| 웹만 만들면 됨 | "텔레그램/디스코드는?" | 3채널 모두 동등한 전체 경험 |
| 사용자 인증 안 함 | "Supabase에 데이터 저장하려면?" | Lazy Auth (익명 → 저장 시 로그인) |
| 텔레그램은 보조 채널 | "core가 뭔가?" | 모든 채널이 동등 |

## Technical Context
- **환경변수**: .env에 ANTHROPIC_API_KEY, DISCORD_BOT_TOKEN, TELEGRAM_BOT_TOKEN, Supabase 설정 모두 구성 완료
- **아키텍처**: 공유 백엔드 서비스 레이어 + 3개 프론트엔드 (Next.js 웹, Telegram Bot, Discord Bot)
- **AI**: Claude Vision API (사진 분석), Claude Text API (메타대화, 인사이트 감지)
- **DB**: Supabase PostgreSQL (users, essences, conversations, insights 테이블 예상)

## API 설계 (PRD 기반)
- `POST /api/analyze` — 이미지 5장 → 에센스 분석 (6축 + 컬러팔레트 + 가설)
- `POST /api/chat` — 글 + 에센스 + 히스토리 → 메타대화 질문/인사이트
- `GET /api/profile` — 에센스 + 인사이트 목록 + 반복 키워드
- `POST /api/crawl` — URL → 본문 텍스트 추출 (서버 사이드)

## Ontology (Key Entities)

| Entity | Type | Fields | Relationships |
|--------|------|--------|---------------|
| 취향 거울 | 서비스 (플랫폼) | name, channels[] | 에센스, 메타대화, 프로필을 포함 |
| 에센스 | core domain | headline, dimensions{6}, palette[], hypothesis | User has one Essence |
| 6축 (Dimensions) | core domain | volume, texture, opacity, tactility, weight, temperature | Essence has 6 Dimensions |
| 메타대화 | feature | article, history[], insights[] | 에센스와 연결, 인사이트 생성 |
| 프로필 | feature | essence, insights[], keywords[] | 에센스 + 인사이트 축적 |
| 사진 | input | image(base64), uploadedAt | 5장이 에센스 분석 입력 |
| Supabase | infrastructure | tables, auth | 모든 데이터 영구 저장 |
| URL 크롤러 | infrastructure | url, extractedText, status | 메타대화 입력 소스 |
| 인사이트 카드 | domain entity | text, tags[], connectedEssence | 메타대화에서 감지/저장 |
| Lazy Auth | infrastructure | sessionUUID, supabaseUserId | 익명 → 인증 전환 |
| Telegram 봇 | 핵심 채널 | chatId, commands[] | 공유 백엔드 호출 |
| Discord 봇 | 핵심 채널 | guildId, commands[] | 공유 백엔드 호출 |

## Ontology Convergence

| Round | Entity Count | New | Changed | Stable | Stability Ratio |
|-------|-------------|-----|---------|--------|----------------|
| 1 | 6 | 6 | - | - | N/A |
| 2 | 7 | 1 | 0 | 6 | 86% |
| 3 | 7 | 0 | 0 | 7 | 100% |
| 4-7 | 7 | 0 | 0 | 7 | 100% |
| 8 | 9 | 1 | 1 | 7 | 89% |
| 9 | 12 | 3 | 2 | 9 | 75% (scope expansion) |
| 10-12 | 12 | 0 | 0 | 12 | 100% |

## Interview Transcript
<details>
<summary>Full Q&A (12 rounds)</summary>

### Round 1
**Q:** 기존 docs와 PRD v3 중 어느 쪽을 구현하나?
**A:** docs는 도구 나열. 만들 것은 PRD v3.
**Ambiguity:** 64% (Goal: 0.50, Constraints: 0.30, Criteria: 0.25)

### Round 2
**Q:** 데이터 저장: localStorage vs Supabase?
**A:** Supabase 사용
**Ambiguity:** 58% (Goal: 0.50, Constraints: 0.50, Criteria: 0.25)

### Round 3
**Q:** 프로젝트 맥락 — 해커톤 vs 개인 프로젝트 vs 실서비스?
**A:** 해커톤 시연용
**Ambiguity:** 47% (Goal: 0.55, Constraints: 0.60, Criteria: 0.45)

### Round 4 (Contrarian Mode)
**Q:** 3페이지 전부 필요한가? 에센스 결과만으로 충분하지 않은가?
**A:** 3페이지 전부 필수
**Ambiguity:** 41% (Goal: 0.65, Constraints: 0.60, Criteria: 0.50)

### Round 5
**Q:** /chat에서 글 입력 방식 — 텍스트만? URL 크롤링?
**A:** URL 크롤링 + 텍스트. 크롤링 가능/불가능 케이스 미리 정의
**Ambiguity:** 38% (Goal: 0.72, Constraints: 0.60, Criteria: 0.50)

### Round 6 (Simplifier Mode)
**Q:** 해커톤 시연 데모 시나리오를 구체적으로?
**A:** 평가 기준이 ralph로 얼마나 큰 서비스를 잘 만들었나. 모든 복잡한 기능 필수
**Ambiguity:** 31% (Goal: 0.80, Constraints: 0.65, Criteria: 0.60)

### Round 7
**Q:** 가설 질문 반응 처리 + 인사이트 감지/저장 방식?
**A:** 자동 감지 + 수동 저장 모두 가능
**Ambiguity:** 27% (Goal: 0.85, Constraints: 0.65, Criteria: 0.65)

### Round 8
**Q:** 사용자 인증 없이 어떻게 데이터를 사용자에 연결?
**A:** Lazy Auth (익명 → 저장 시 로그인). + 텔레그램/디스코드로도 접근 가능하면 좋겠다
**Ambiguity:** 39% ↑ (Goal: 0.70, Constraints: 0.55, Criteria: 0.55) — 스코프 확장

### Round 9 (Ontologist Mode)
**Q:** 취향 거울의 core — 웹 서비스? 아니면 멀티채널 경험?
**A:** 모든 채널이 동등
**Ambiguity:** 44% ↑ (Goal: 0.65, Constraints: 0.50, Criteria: 0.50) — 스코프 재확장

### Round 10
**Q:** 3채널 구현 순서와 텔레그램/디스코드 전체 경험 범위?
**A:** 웹 먼저, 텔레그램, 디스코드 순서
**Ambiguity:** 34% (Goal: 0.75, Constraints: 0.65, Criteria: 0.55)

### Round 11
**Q:** 텔레그램 UX — 채팅 플로우? 웹앱 하이브리드?
**A:** 순수 채팅 플로우 그대로
**Ambiguity:** 29% (Goal: 0.82, Constraints: 0.68, Criteria: 0.60)

### Round 12
**Q:** Acceptance criteria 13개 항목 검증
**A:** 보관해두고, 추가 기획 문서 들어오면 다시 계획 세울 예정
**Ambiguity:** 29% (early exit)

</details>
