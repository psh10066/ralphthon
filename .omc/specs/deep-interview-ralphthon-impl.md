# Deep Interview Spec: Droppi 구현 계획 구체화

## Metadata
- Interview ID: ralphthon-impl-2026-03-29
- Rounds: 20 (보완 4라운드 포함)
- Final Ambiguity Score: 10%
- Type: brownfield
- Generated: 2026-03-29
- Threshold: 20%
- Status: PASSED

## Clarity Breakdown
| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Goal Clarity | 0.87 | 35% | 0.305 |
| Constraint Clarity | 0.78 | 25% | 0.195 |
| Success Criteria | 0.75 | 25% | 0.188 |
| Context Clarity | 0.80 | 15% | 0.120 |
| **Total Clarity** | | | **0.808** |
| **Ambiguity** | | | **19%** |

## Goal
사진에서 취향 에센스를 읽고, 메타대화로 자기 이해를 깊게 만드는 AI 서비스 **Droppi** (drop + I)를 웹앱 + 텔레그램 봇으로 구현한다. 해커톤 시연용으로, "ralph로 얼마나 큰 서비스를 잘 만들었나"가 평가 기준.

## 리브랜딩 (Round 17-20 보완)

### 서비스명: Droppi
- 메타포: 빈 캔버스 (코튼 캔버스 — 따뜻하지만 꾸미지 않은)
- 톤: 모던하고 건조. 귀엽지 않다. 무게가 있다.
- 사용자 내부 호칭: dropper

### 용어 체계
| 용어 | 의미 | 기존 용어 |
|------|------|----------|
| drop | 사진/글/메모를 넣는 행위 | 입력 |
| dropper | 사용자 | 사용자 |
| 에센스 | drop에서 읽어낸 취향의 본질 | (동일) |
| 켜 | drop이 쌓여 만들어진 층위 | 클러스터 |

### 디자인 변경
- 배경: #FFFFFF → 미색 (warm off-white)
- 악센트: 에센스 팔레트 → 형광 계열 (발견/변화 순간만)
- 구조선: 블랙 1~1.5px
- 레이아웃: 타이포 중심 + 컬러 블록 그룹핑
- 사진: 썸네일 축소 금지, 넉넉하게
- 입력 버튼: "보내기" → "drop"
- Drop 모션: 물방울 떨어져 캔버스에 스며드는 애니메이션 (Framer Motion)
- 에센스 팔레트: 유지 (데코로 5색 원 표시)

### WOW 화면 변경 (Round 20)
- 에센스 결과 후 **가설 질문** 표시 (기존: 열린 호기심 질문)
- **반응 버튼 3개**: 맞아요 / 좀 다른데 / 잘 모르겠어요
- 반응 분기:
  - 맞아요 → 에센스 확정 → 홈
  - 좀 다른데 → 텍스트 입력 → /chat (첫 메타대화)
  - 잘 모르겠어요 → "괜찮아요. drop 하다 보면 보여요." → 홈

## 스코프 확정

### 포함
| 기능 | 설명 |
|------|------|
| 웹앱 6페이지 | 랜딩+온보딩, 홈, 대화, 대화상세, 세션로그, 프로필 |
| 에센스 엔진 | 사진 1~5장 → 6축 에센스 분석 (유연한 사진 수) |
| 대화 엔진 | image/text/link/memo 입력 → 메타대화 질문 |
| 축적 엔진 | 패턴 감지 + 클러스터링 (AI 기반, 텍스트 리스트 UI) |
| 텔레그램 봇 | Webhook + 대화 + 에센스 분석 + 웹 링크 안내 |
| Voice Input | Web Speech API SpeechRecognition (STT), /chat + /home 입력 영역 마이크 버튼 |
| 주간 리포트 | on-demand (사용자가 버튼 클릭 시 생성) |
| Eval 자동화 | 골든 셋 E1~E4, D1~D5, A1~A3 전체 자동 테스트 |

### 제외
| 기능 | 이유 |
|------|------|
| Discord 연동 | product.md 핵심 채널이 아님 |
| Voice Output (TTS) | 불필요 |
| 공유 이미지 생성 | POST /api/share 및 관련 UI 제외 |
| 등고선 지형도 시각화 | 복잡도 대비 가치 낮음. 텍스트 리스트 UI로 대체 |

## Constraints

### 사용자 인증: Lazy Auth
- **웹 첫 방문**: 인증 없이 에센스 분석 + 대화 체험 가능
- **데이터 임시 저장**: localStorage에 에센스 + 대화 데이터 보관
- **저장 트리거**: 사용자가 "저장하고 싶다"고 할 때 계정 생성 안내
- **계정 생성**: 텔레그램 딥링크로 가입 → localStorage 데이터를 Supabase로 마이그레이션
- **텔레그램 연동**: 웹에서 "텔레그램에서도 해보기" 버튼 → 텔레그램 봇 딥링크로 연결

### Lazy Auth 마이그레이션 상세 흐름
```
웹에서 "저장" 클릭
  → t.me/bot?start=WEB_{sessionId} 딥링크 열림
  → 텔레그램에서 /start WEB_{sessionId} 수신
  → 봇이 telegram_uid + sessionId로 user 생성 (Supabase)
  → 웹이 폴링으로 계정 생성 감지 (sessionId로 user 조회)
  → localStorage 데이터(에센스, 대화, 인사이트)를 Supabase로 업로드
  → 이후 웹/텔레그램 모두 같은 user_id로 동작
```

### 이미지 저장
- base64로 `essence_profiles` 테이블에 JSONB 컬럼(`raw_images`)으로 저장
- 별도 스토리지 없음 (해커톤 용도)

### 에센스 분석: 유연한 사진 수
- **최소 1장**부터 에센스 분석 가능 (기존 5장 고정에서 변경)
- 사진 수에 따라 분석 깊이 조절 (1장: 기본, 3장+: 교집합 추출, 5장: 풀 분석)
- 분석 후 "사진 더 보내면 더 깊게 읽을 수 있어요" 안내
- 웹 랜딩 카피 수정 필요 ("사진 5장이면" → 유연한 표현)
- 웹 업로드 UI: 1장이라도 CTA 활성화, 5장까지 추가 가능

### 링크 처리: 3단계 폴백
1. 서버사이드 스크래핑 (cheerio로 HTML 파싱)
2. 실패 시 AI 리서치 (Claude에게 URL/제목 기반 글 내용 추론)
3. 그래도 실패 시 사용자에게 "글의 핵심 부분을 붙여넣어볼래요?" 안내
- 링크드인 등 스크래핑 제한 사이트는 입력 시점에 미리 안내 토스트

### 입력 타입 네이밍 통일
- `image | text | link | memo` (api.md 기준)
- dialogue.md의 `photo` → `image`, `article` → `text`로 변경

### 클러스터링 실행 시점
- 인사이트 저장 시 즉시 Claude API로 클러스터 재계산
- 실시간 반영 (프로필 조회 시 최신 클러스터 노출)

### 에센스 재분석
- 사진 추가 시 자동 재분석 (기존 사진 + 새 사진 합산)
- 새 EssenceProfile row 추가 → 최신 1건이 현재 에센스
- 이전 에센스는 변화 이력으로 보존 (프로필에서 before/after 표시)

### Eval 테스트 사진
- Unsplash 무료 사진으로 골든 셋 E1~E4 수집
- `tests/fixtures/` 디렉토리에 저장
- 라이선스: Unsplash License (무료 상업 이용 가능)

### 세션 경계
- 홈에서 새 입력 = 항상 새 세션 생성
- 이전 세션은 세션 로그(/sessions)에서 읽기 전용으로 확인
- 텔레그램도 동일: 새 입력마다 새 세션

### 인사이트 저장 UX
- AI가 인사이트 감지 시 인사이트 카드에 "저장할까요?" 버튼 표시
- 사용자 확인 시 Supabase 저장 + 클러스터 즉시 업데이트
- 자동 저장 아님 — 사용자 주도

### 지형도 → 텍스트 리스트
- 등고선 SVG 시각화 제외
- 클러스터 라벨 + 인사이트 수 + 키워드 목록으로 표현
- 클러스터 탭 시 해당 인사이트 목록 펼침

## Non-Goals
- Discord 봇/슬래시 커맨드
- 음성 출력 (TTS)
- 공유 이미지 생성 (카카오/인스타)
- 등고선 지형도 시각화
- 주간/월간 리포트 자동 발송 (cron)
- Supabase Auth (Google/GitHub 소셜 로그인)
- 인스타그램 연동

## Acceptance Criteria
- [ ] 웹 랜딩 → 사진 1장 이상 업로드 → 에센스 결과 표시 → 대화 진입 (끊김 없이)
- [ ] 에센스 한 줄이 "따뜻한 사람" 수준이 아닌 구체적 감각 표현
- [ ] 사진 1장/3장/5장에서 각각 에센스 분석 동작
- [ ] 에센스 결과 후 열린 호기심 질문 (가설이 아닌 관찰+질문)
- [ ] 대화에서 AI가 요약하지 않고 질문 (10턴 중 요약/진단 0개)
- [ ] image/text/link/memo 4가지 입력 타입 각각 동작
- [ ] 링크 입력 시 3단계 폴백 (스크래핑 → AI리서치 → 붙여넣기 안내)
- [ ] 인사이트 감지 → 저장 → 클러스터 즉시 업데이트
- [ ] 프로필에서 클러스터 목록 + 인사이트 + 반복 키워드 확인
- [ ] 주간 리포트 버튼 클릭 시 생성
- [ ] 텔레그램에서 사진 1장 → 에센스 분석 → 대화 가능
- [ ] 텔레그램에서 인사이트 감지 → 웹 링크 안내
- [ ] 웹 익명 사용자 체험 → "저장" 시 텔레그램 딥링크 안내 → 계정 생성 → 데이터 마이그레이션
- [ ] Voice Input (STT) 동작
- [ ] 모바일 반응형 375px 깨지지 않음
- [ ] eval 골든 셋 전체 자동 테스트 PASS
- [ ] 에센스 일관성 테스트: 같은 사진 3회 분석 시 방향 동일

## Assumptions Exposed & Resolved
| Assumption | Challenge | Resolution |
|------------|-----------|------------|
| 사진은 반드시 5장 | 텔레그램은 1장씩 전송. 5장 강제하면 이탈 | 최소 1장, 최대 5장. 점진적 분석 |
| 웹 랜딩 카피 "사진 5장이면" | 1장부터 가능하면 카피 변경 필요 | 유연한 표현으로 수정 |
| Discord 필수 | product.md에 텔레그램+웹만 핵심 채널 | Discord 제외 |
| 등고선 지형도 필수 | 구현 복잡도 높고 해커톤 시연에서 텍스트로도 충분 | 텍스트 리스트로 대체 |
| 공유 이미지 필수 | 에센스 직후가 아니라 대화 후 공유인데, 핵심 경로 아님 | 제외 |
| localStorage 대신 Supabase | Lazy Auth로 웹 익명 체험 → 저장 시 가입 | localStorage 임시 → Supabase 마이그레이션 |
| 이미지 별도 스토리지 | 해커톤 규모에서 Supabase Storage 불필요 | base64 DB 저장 |
| STT/TTS 포함 여부 | CLAUDE.md에 있지만 스펙에 없음 | STT만 포함, TTS 제외 |
| 주간 리포트 자동 발송 | 트리거 메커니즘 미정 | on-demand (버튼 클릭) |
| 입력 타입 네이밍 | docs 간 불일치 | api.md 기준 통일: image/text/link/memo |

## 디자인 레퍼런스 이미지

구현 시 `docs/design/` 폴더의 이미지를 참고할 것:

| 파일 | 참고 포인트 |
|------|-----------|
| `77a01...jpg` | 타이포 중심 모바일 레이아웃, 사진 넉넉하게, 미색/다크 전환 |
| `1862d...jpg` | 컬러 블록 그룹핑, 뮤트 톤 + 형광 악센트 |
| `d3dff...jpg` | 뮤트 그린 블록 + 형광 악센트, 가설 질문 영역 무드 |
| `ac560...jpg` | 가는 라인 리스트 1~1.5px, 등고선 형태 무드 |
| `d5a49...jpg` | 컬러 블록 카드 그리드, 인사이트/클러스터 레이아웃 |
| `white-fabric-*.jpg` | 코튼 캔버스 배경 텍스처 (미색 톤 레퍼런스) |

## Technical Context

### 기존 코드베이스
- Next.js 14 프로젝트 구조만 생성됨 (src/app/api 디렉토리)
- 구현 코드 없음 — 순수 greenfield 구현
- .env 파일에 모든 환경변수 설정됨 (Anthropic, Supabase, Telegram)
- docs 22개 파일에 상세 스펙 문서화

### 수정 필요한 docs
| 문서 | 수정 내용 |
|------|----------|
| spec/product.md | 채널에서 Discord 제거, 사진 수 유연화 반영 |
| spec/api.md | POST /api/share 제거, /api/analyze 사진 수 1~5장으로 변경 |
| spec/data-schema.md | essence_profiles에 raw_images 컬럼 추가, users에 web_session_id 추가 |
| spec/screens.md | 랜딩 카피 수정, 업로드 UI 유연화, 지형도 → 텍스트 리스트 |
| spec/funnel.md | "사진 5장이면" → 유연한 카피, CTA 조건 변경 |
| engine/essence.md | 1~5장 분석 분기 프롬프트 |
| engine/dialogue.md | 입력 타입 photo→image, article→text |
| design/components.md | 지형도 컴포넌트 → 클러스터 리스트 컴포넌트 |
| spec/eval.md | 유연한 사진 수 반영, eval 자동화 스크립트 구조 |

## Ontology (Key Entities)

| Entity | Type | Fields | Relationships |
|--------|------|--------|---------------|
| User | core domain | id, telegram_uid, web_session_id, onboarding_completed | has many EssenceProfiles, Sessions |
| EssenceProfile | core domain | headline, dimensions(6축), palette, observation, firstQuestion, raw_images | belongs to User, 1~5 photos |
| Session | core domain | input_type(image/text/link/memo), input_preview, confirmed_patterns | belongs to User, has many Messages |
| Message | core domain | role(user/assistant), content, type(question/insight), input_type | belongs to Session |
| Insight | supporting | text, tags, connected_essence | belongs to Session, triggers Cluster update |
| TopographyCluster | supporting | label, height, keywords, insights | belongs to User, text list UI |
| TelegramBot | external system | webhook, chat_id, message handling | creates/links User |
| VoiceInput | supporting | Web Speech API SpeechRecognition | feeds into chat input |

## Ontology Convergence

| Round | Entity Count | New | Changed | Stable | Stability Ratio |
|-------|-------------|-----|---------|--------|----------------|
| 1 | 7 | 7 | - | - | N/A |
| 2-4 | 7 | 0 | 0 | 7 | 100% |
| 5 | 8 | 1 (VoiceInput) | 0 | 7 | 88% |
| 6-7 | 8 | 0 | 0 | 8 | 100% |
| 8 | 8 | 0 | 1 (EssenceProfile: min photos 5→1) | 7 | 88% |
| 9-10 | 8 | 0 | 0 | 8 | 100% |

## Interview Transcript
<details>
<summary>Full Q&A (10 rounds)</summary>

### Round 1
**Q:** 웹앱에서 사진 업로드하고 에센스 분석을 받는 사용자는 어떻게 식별되나요?
**A:** 사용자가 개인 대화를 저장하고 싶을 때 저장 안내. 웹에서 시작 → "텔레그램에서도 해보기" 버튼으로 연동.
**Ambiguity:** 56% (Goal: 0.75, Constraints: 0.30, Criteria: 0.60, Context: 0.50)

### Round 2
**Q:** '계정 생성'은 구체적으로 어떤 방식? 웹 익명 세션 데이터는 어디에?
**A:** localStorage → 저장 시 가입 (텔레그램 딥링크)
**Ambiguity:** 41% (Goal: 0.75, Constraints: 0.40, Criteria: 0.60, Context: 0.50)

### Round 3
**Q:** 이미지들의 생명주기는? 원본 이미지는 어디에 저장?
**A:** base64로 DB 저장
**Ambiguity:** 40% (Goal: 0.75, Constraints: 0.45, Criteria: 0.60, Context: 0.50)

### Round 4 (Contrarian Mode)
**Q:** 이번 구현 스코프에 Discord, STT/TTS, 주간리포트, 공유이미지 중 어떤 것들을 포함?
**A:** 핵심만 + 주간리포트는 on-demand 버튼, voice input은 포함 (output 제외). 공유 이미지 제외.
**Ambiguity:** 35% (Goal: 0.78, Constraints: 0.50, Criteria: 0.60, Context: 0.65)

### Round 5
**Q:** 등고선 지형도가 정말 필수인가? (Contrarian)
**A:** AI가 패턴 감지하는 정도로만. 지형도 시각화는 불필요.
**Ambiguity:** 33% (Goal: 0.80, Constraints: 0.55, Criteria: 0.60, Context: 0.70)

### Round 6
**Q:** URL에서 콘텐츠를 어떻게 추출?
**A:** 스크래핑 시도 → AI 리서치 → 안내. 제한 사이트는 미리 안내.
**Ambiguity:** 31% (Goal: 0.80, Constraints: 0.62, Criteria: 0.60, Context: 0.72)

### Round 7 (Simplifier Mode)
**Q:** eval을 어디까지 자동화하고 어디는 수동?
**A:** 전부 자동화
**Ambiguity:** 28% (Goal: 0.80, Constraints: 0.62, Criteria: 0.72, Context: 0.72)

### Round 8
**Q:** 텔레그램에서 사진 5장 수집 방식은?
**A:** 최소 1장도 가능. 에센스가 충분하지 않으면 추가 요청.
**Ambiguity:** 26% (Goal: 0.82, Constraints: 0.65, Criteria: 0.72, Context: 0.72)

### Round 9
**Q:** 웹 온보딩 퍼널도 유연하게 변경?
**A:** 웹도 1장부터 가능
**Ambiguity:** 24% (Goal: 0.87, Constraints: 0.68, Criteria: 0.72, Context: 0.72)

### Round 10
**Q:** 인터페이스 타입 불일치 + 클러스터링 실행 시점
**A:** api.md 기준 통일 (image/text/link/memo). 인사이트 저장 시 즉시 클러스터링.
**Ambiguity:** 19% (Goal: 0.87, Constraints: 0.78, Criteria: 0.75, Context: 0.80)

### Round 11
**Q:** Voice Input(STT)이 어떤 화면에서 어떻게 동작하나요?
**A:** 모든 입력 영역 (/chat + /home)에 마이크 버튼 추가
**Ambiguity:** 18% (Goal: 0.90, Constraints: 0.78, Criteria: 0.75, Context: 0.80)

### Round 12
**Q:** 텔레그램 봇이 웹 세션과 어떻게 연결되나요?
**A:** 딥링크에 session_id 포함. t.me/bot?start=WEB_{sessionId} → 봇이 매칭 → 웹 폴링 감지 → 데이터 업로드
**Ambiguity:** 16% (Goal: 0.90, Constraints: 0.83, Criteria: 0.78, Context: 0.82)

### Round 13
**Q:** 에센스 eval 골든 셋 테스트용 사진을 어떻게 확보?
**A:** Unsplash 무료 사진으로 수집, tests/fixtures/에 저장
**Ambiguity:** 15% (Goal: 0.90, Constraints: 0.83, Criteria: 0.82, Context: 0.82)

### Round 14
**Q:** 사진 추가 시 에센스 자동 재분석인지, 수동 버튼인지?
**A:** 사진 추가 시 자동 재분석 (기존+새 사진 합산, 새 row 추가)
**Ambiguity:** 12% (Goal: 0.92, Constraints: 0.87, Criteria: 0.85, Context: 0.85)

### Round 15
**Q:** 홈에서 새 입력 시 항상 새 세션? 기존 세션 이어가기?
**A:** 입력마다 새 세션. 이전 세션은 세션 로그에서 읽기 전용.
**Ambiguity:** 11% (Goal: 0.92, Constraints: 0.90, Criteria: 0.85, Context: 0.87)

### Round 16
**Q:** 인사이트 감지 시 사용자 확인 후 저장? 자동 저장?
**A:** 사용자 확인 후 저장. "저장할까요?" 버튼 → 확인 시 Supabase 저장.
**Ambiguity:** 10% (Goal: 0.93, Constraints: 0.90, Criteria: 0.87, Context: 0.88)

</details>
