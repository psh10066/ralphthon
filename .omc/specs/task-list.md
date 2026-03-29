# Droppi — 최종 태스크 목록

> Deep Interview 스펙 (20라운드) + 유저스토리 (37개) + 검증루프 (52항목) 기반
> build-guide.md 7 Phase + CLAUDE.md 필수 태스크 포함

---

## Phase 1: 뼈대

| # | 태스크 | 참조 | 완료 기준 |
|---|--------|------|----------|
| 1-1 | Next.js 프로젝트 셋업 (TS + Tailwind v4) | setup.md | `npm run dev` 동작 |
| 1-2 | 6개 페이지 라우팅 (`/`, `/home`, `/chat`, `/chat/:id`, `/sessions`, `/profile`) | spec/product.md | 모든 경로 접근 가능 |
| 1-3 | Droppi 디자인 토큰 (미색 배경, 블랙 구조선, Noto Serif KR + Pretendard, 형광 악센트) | design/principles.md, design/components.md | CSS 변수 적용된 빈 페이지 |
| 1-4 | 공통 레이아웃 (하단 탭 네비: 홈/세션/프로필, 모바일 375px 기준) | design/principles.md | 네비게이션 동작 |
| 1-5 | Supabase 스키마 초기화 (users, essence_profiles+raw_images, sessions, messages, insights, topography_clusters) | spec/data-schema.md | 모든 테이블 생성 + RLS |
| 1-6 | lib/ 모듈 셋업 (supabase.ts, anthropic.ts, telegram.ts) | api-reference.md | import 가능 |

## Phase 2: 에센스 엔진

| # | 태스크 | 참조 | 완료 기준 |
|---|--------|------|----------|
| 2-1 | `POST /api/analyze` 구현 (1~5장 유연, base64 입력) | engine/essence.md, spec/api.md | Claude Vision API 호출 성공 |
| 2-2 | 에센스 시스템 프롬프트 (6축 + 한 줄 + **가설 질문** + 팔레트) | engine/essence.md | JSON 파싱 성공 |
| 2-3 | 사진 수별 분기 (1장: 기본, 3장+: 교집합, 5장: 풀 분석) | 스펙 Round 8-9 | 1/3/5장 각각 동작 |
| 2-4 | raw_images base64 DB 저장 | 스펙 Round 3 | essence_profiles.raw_images 컬럼에 저장 |
| 2-5 | Eval 골든 셋 E1~E4 자동 테스트 | spec/eval.md §1 | Unsplash 사진 + PASS |
| 2-6 | 에센스 일관성 테스트 (3회 방향 동일) | spec/eval.md §1-2 | 3회 PASS |

## Phase 3: 대화 엔진

| # | 태스크 | 참조 | 완료 기준 |
|---|--------|------|----------|
| 3-1 | `POST /api/chat` 구현 (image/text/link/memo 분기) | engine/dialogue.md, spec/api.md | 입력 타입별 동작 |
| 3-2 | 대화 시스템 프롬프트 (에센스 컨텍스트 주입, 요약 금지) | engine/dialogue.md | 질문 생성 |
| 3-3 | 링크 처리 3단계 폴백 (cheerio 스크래핑 → AI 리서치 → 붙여넣기 안내) | 스펙 Round 6 | 각 단계 동작 |
| 3-4 | 제한 사이트 안내 토스트 (링크드인 등) | 스펙 Round 6 | 토스트 표시 |
| 3-5 | 인사이트 감지 (type: 'insight' 응답) | engine/dialogue.md | 인사이트 JSON 생성 |
| 3-6 | 세션 = 입력마다 새 생성 | 스펙 Round 15 | 연속 입력 시 ID 다름 |
| 3-7 | Eval 골든 셋 D1~D5 + 질문 분류 자동화 | spec/eval.md §2 | 요약/진단 0개 |

## Phase 4: 축적 엔진

| # | 태스크 | 참조 | 완료 기준 |
|---|--------|------|----------|
| 4-1 | 인사이트 저장 (사용자 확인 후) + 즉시 클러스터링 | engine/accumulation.md, 스펙 Round 10,16 | insert → 클러스터 업데이트 |
| 4-2 | `GET /api/profile` (에센스 + 인사이트 + 클러스터 + 키워드) | spec/api.md | JSON 응답 |
| 4-3 | `GET /api/sessions`, `GET /api/sessions/:id` | spec/api.md | 목록 + 상세 |
| 4-4 | 에센스 재분석 (사진 추가 시 자동, 새 row) | 스펙 Round 14 | before/after 생성 |
| 4-5 | 주간 리포트 on-demand (버튼 클릭 시) | 스펙 Round 4 | 리포트 텍스트 생성 |
| 4-6 | Eval 골든 셋 A1~A3 자동 테스트 | spec/eval.md §3 | 패턴 감지 PASS |

## Phase 5: 화면 조립 (Droppi 디자인)

| # | 태스크 | 참조 | 완료 기준 |
|---|--------|------|----------|
| 5-1 | 랜딩 (`/`) — 빈 캔버스, "Droppi", "사진을 드롭해 보세요", drop CTA | user-scenario-funnel F1 | 미색 배경 + 타이포 중심 |
| 5-2 | 업로드 — 2열 그리드, 1장부터 CTA 활성, X 교체, 5장 제한 | user-scenario-funnel F2 | 사진 업로드 + 카운터 |
| 5-3 | 로딩 — 4단계 텍스트 (보고/읽고/찾고/거의 다) | design/components.md §8 | 12초 애니메이션 |
| 5-4 | WOW 화면 — 에센스 한 줄 + 6축 바 + 팔레트 5색 + **가설 질문** + **반응 버튼 3개** + 분기 | user-scenario-funnel F3 | 맞아요→홈, 좀 다른데→/chat, 모르겠어요→홈 |
| 5-5 | 홈 (`/home`) — 에센스 한 줄 상단 + 입력 영역(drop 버튼, 마이크) + 최근 발견 + 클러스터 프리뷰 | spec/screens.md | 입력 → 새 세션 |
| 5-6 | 대화 (`/chat`) — 대화 버블 + 인사이트 블록("저장할까요?") + 입력(drop, 마이크) | design/components.md §1,3 | 대화 동작 |
| 5-7 | 세션 상세 (`/chat/:id`) — 읽기 전용 대화 + 발견 + 패턴 | spec/screens.md | 상세 표시 |
| 5-8 | 세션 로그 (`/sessions`) — 날짜별 목록 + 발견 하이라이트 | spec/screens.md | 목록 표시 |
| 5-9 | 프로필 (`/profile`) — 에센스 + 변화 이력 + 클러스터 리스트 + 키워드 + 리포트 버튼 | spec/screens.md | 전체 표시 |
| 5-10 | Drop 모션 (물방울 떨어져 스며듬, Framer Motion) | design/components.md §9 | 텔레그램 동기화 + 웹 입력 시 |
| 5-11 | Voice Input — /home + /chat 마이크 버튼 (Web Speech API) | 스펙 Round 11 | STT 동작 |
| 5-12 | Lazy Auth UI — "저장" → 텔레그램 딥링크 + 연결 대기 상태 | 스펙 Round 6-7,12 | 딥링크 + 폴링 |
| 5-13 | 빈 상태 처리 — 에센스 미완 안내, 인사이트 0개 안내, 패턴 생성 중 | US9-4, US13-4 | 안내 문구 |

## Phase 6: 텔레그램 봇

| # | 태스크 | 참조 | 완료 기준 |
|---|--------|------|----------|
| 6-1 | Webhook 설정 (`POST /api/telegram/webhook`) | spec/api.md 텔레그램 | 메시지 수신 |
| 6-2 | 첫 진입 온보딩 ("사진을 보내주세요") | US25 | 안내 메시지 |
| 6-3 | 사진 → /api/analyze 연결 (1장부터) | US21 | 에센스 텍스트 전송 |
| 6-4 | 텍스트/링크 → /api/chat 연결 | US23 | 질문 응답 |
| 6-5 | 인사이트 → 웹 링크 안내 | US24 | "웹에서 확인" 메시지 |
| 6-6 | 웹 계정 연결 (/start WEB_{sessionId}) + 마이그레이션 | US26, 스펙 Round 12 | 계정 병합 |

## Phase 7: 빌드 검증 + QA (CLAUDE.md 필수)

| # | 태스크 | blockedBy | 완료 기준 |
|---|--------|-----------|----------|
| 7-1 | `npm run build` 성공 + 테스트 통과 | Phase 1~6 전체 | 빌드 0 에러 |
| 7-2 | Eval 자동 테스트 전체 실행 (E1~E4, D1~D5, A1~A3) | 7-1 | 전체 PASS |
| 7-3 | 로컬 QA — Playwright MCP로 52개 검증 항목 전체 확인 | 7-2 | 스크린샷 + 콘솔 0 에러 |
| 7-4 | Vercel 배포 | 7-3 | 배포 URL 생성 |
| 7-5 | 배포 QA — Playwright MCP로 배포 URL 52개 항목 재확인 | 7-4 | 스크린샷 + 콘솔 0 에러 |
| 7-6 | 반응형 QA — 모바일 뷰포트(390px) 전체 페이지 확인 | 7-5 | 390px 스크린샷 |

---

## 태스크 통계

| Phase | 태스크 수 |
|-------|----------|
| 1. 뼈대 | 6 |
| 2. 에센스 엔진 | 6 |
| 3. 대화 엔진 | 7 |
| 4. 축적 엔진 | 6 |
| 5. 화면 조립 | 13 |
| 6. 텔레그램 봇 | 6 |
| 7. 빌드+QA | 6 |
| **합계** | **50** |
