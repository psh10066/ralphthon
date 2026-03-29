# Deep Interview Spec: droppi 풀 스펙 구현

## Metadata
- Interview ID: di-ralphthon-20260329
- Rounds: 5
- Final Ambiguity Score: 20%
- Type: greenfield
- Generated: 2026-03-29
- Threshold: 0.2
- Status: PASSED

## Clarity Breakdown
| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Goal Clarity | 0.85 | 0.40 | 0.34 |
| Constraint Clarity | 0.80 | 0.30 | 0.24 |
| Success Criteria | 0.75 | 0.30 | 0.23 |
| **Total Clarity** | | | **0.80** |
| **Ambiguity** | | | **0.20** |

## Goal

droppi — 뭐든 하나 drop(사진/글/링크/메모)하면 AI가 읽기 결과를 제공하고, 사용자가 원하면 메타대화로 이어지며, 주제별로 클러스터링되어 축적되는 자기이해 서비스를 **Phase 1~3 풀 스펙으로 구현**한다.

핵심 루프: Drop → 읽기 결과 → (선택적) 대화 → 축적(주제 모음)

## Constraints
- **개발 방식**: AI ralph-loop으로 자율 구현. 사람 개발자 없음.
- **마감**: 없음. 완성도 우선.
- **인프라**: Supabase 프로젝트, Claude API 키, Vercel 연결 — 모두 준비 완료.
- **기술 스택**: Next.js 14 (App Router) + TypeScript + Tailwind CSS v4 + Supabase + Claude API + Vercel
- **인증**: 로그인 없이 익명. 브라우저 세션/로컬스토리지로 사용자 식별.
- **SSOT**: docs/spec/screens.md가 화면 설계 정본. 다른 문서는 이를 참조.
- **QA**: CLAUDE.md의 HARD-GATE 규칙 준수 (빌드 → 로컬 QA → Vercel 배포 → 배포 QA → 반응형 QA)

## Non-Goals
- 네이티브 앱 (웹앱만)
- 유료 결제/과금
- 관리자 대시보드
- 소셜 로그인 (익명만)
- 실시간 알림 (크론 기반 주간 리포트만)

## Acceptance Criteria

### 핵심 플로우
- [ ] 랜딩 페이지에서 사진/글/링크/메모 중 하나를 drop할 수 있다
- [ ] drop 후 입력별 로딩 카피가 3단계로 표시된다
- [ ] 읽기 결과 화면에 인사이트 한 줄 + 관찰 사실 + 주제/스타일 태그가 표시된다
- [ ] 읽기 결과에서 자유 반응 입력 시 즉시 /chat으로 전환되어 대화가 시작된다
- [ ] 읽기 결과에서 "그냥 넘어갈래요" 시 읽기만 저장 후 /home 이동
- [ ] 대화 3턴 이상 진행 시 인사이트 카드가 1회 이상 나타난다
- [ ] 인사이트 카드 "기록할까요?" 탭 시 프로필 축적된 발견에 반영된다

### 재방문 + 축적
- [ ] /home에서 다시 drop하면 로딩 → 읽기 결과 흐름이 반복된다
- [ ] 여러 번 drop한 결과가 /themes에 주제별로 클러스터링되어 표시된다
- [ ] /profile에서 에센스 한 줄 + 주제/스타일 태그 + 발견 목록 + 반복 키워드가 보인다
- [ ] 다음 날 재방문 시 이전 데이터가 유지된다 (Supabase 저장)

### 타인 사용 가능
- [ ] URL 공유만으로 다른 사람이 온보딩부터 시작할 수 있다
- [ ] 각 사용자의 데이터가 분리된다 (익명 식별)
- [ ] 모바일(375px)에서 전체 플로우가 정상 동작한다

### QA (CLAUDE.md HARD-GATE)
- [ ] `npm run build` 성공
- [ ] 로컬에서 Playwright MCP로 모든 기능 검증
- [ ] Vercel 배포 완료
- [ ] 배포 URL에서 Playwright MCP로 전체 기능 재검증
- [ ] 모바일 뷰포트(390px)에서 전체 기능 확인

## Assumptions Exposed & Resolved
| Assumption | Challenge | Resolution |
|------------|-----------|------------|
| Phase 1만 먼저 구현 | "최소 범위가 뭐예요?" | 풀 스펙 Phase 1~3 전체 구현 |
| 마감이 있을 것 | "언제까지?" | 마감 없음. 완성도 우선 |
| 로그인이 필요할 것 | "다른 사람이 쓰려면 인증이?" | 로그인 없이 익명 |
| 인프라 셋업이 필요할 것 | "Supabase/Vercel 준비됐나?" | 모두 준비 완료 |

## Technical Context
- **소스 코드**: 없음 (greenfield). Next.js 프로젝트 초기화부터 시작.
- **스펙 문서**: docs/ 하위에 screens.md, funnel.md, data-schema.md, dialogue.md, accumulation.md, essence.md 등 완성된 상태
- **데이터 스키마**: data-schema.md에 Supabase 테이블 + TypeScript 인터페이스 정의됨
- **AI 엔진**: essence.md(읽기 분석), dialogue.md(메타대화), accumulation.md(축적) 3개 엔진 스펙 있음
- **디자인**: screens.md에 와이어프레임 + 인터랙션 상세. 디자인 톤: 투명, 여백, 콘텐츠 중심.

## Ontology (Key Entities)

| Entity | Type | Fields | Relationships |
|--------|------|--------|---------------|
| AnonymousUser | core domain | id (= auth.uid()), onboarding_completed | has many Sessions, Readings, Insights |
| Reading | core domain | input_type, input_preview, insight, observation, tags, topic_tags, style_tags, had_conversation | belongs to User, optionally to Session, many-to-many with ThemeCluster |
| EssenceProfile | core domain | headline, palette, topic_tags, style_tags | belongs to User, versioned (latest = current) |
| Session | supporting | input_type, input_preview, confirmed_patterns | belongs to User, has many Messages |
| Message | supporting | role, content, type, input_type | belongs to Session |
| Insight | core domain | text, tags, connected_essence | belongs to User + Session |
| ThemeCluster | core domain | label, reading_ids, keywords, reading_count, conversation_count, ai_summary | belongs to User, contains many Readings |
| MonthlyFlow | supporting | period, topic/style_distribution | belongs to User |

## Ontology Convergence
| Round | Entity Count | New | Changed | Stable | Stability Ratio |
|-------|-------------|-----|---------|--------|----------------|
| 1 | 5 | 5 | - | - | N/A |
| 2 | 5 | 0 | 0 | 5 | 100% |
| 3 | 5 | 0 | 0 | 5 | 100% |
| 4 | 5 | 0 | 0 | 5 | 100% |
| 5 | 6 | 1 | 0 | 5 | 83% |

## Interview Transcript
<details>
<summary>Full Q&A (5 rounds)</summary>

### Round 1
**Q:** 이번 구현에서 "여기까지 되면 사람한테 보여줄 수 있다"라고 생각하는 최소 범위가 뭐예요?
**A:** 풀 스펙 (Phase 1~3)
**Ambiguity:** 100% → scoring 시작 전

### Round 2
**Q:** 언제까지 동작하는 버전이 나와야 해요? 개발은 누가 해요?
**A:** 마감 없음. AI ralph-loop으로.
**Ambiguity:** 51% (Goal: 0.70, Constraints: 0.50, Criteria: 0.20)

### Round 3
**Q:** "오케이 이거 된다" 하려면 뭐가 돼야 해요?
**A:** 플로우가 끝까지 돌아야 하고, 다른 사람이 써봐도 돼야 함. 물론 다.
**Ambiguity:** 37% (Goal: 0.75, Constraints: 0.55, Criteria: 0.55)

### Round 4 [Contrarian Mode]
**Q:** Supabase/Vercel/Claude API 준비 됐어요?
**A:** 전부 준비됨.
**Ambiguity:** 28% (Goal: 0.80, Constraints: 0.75, Criteria: 0.60)

### Round 5
**Q:** 웹앱 사용자 식별은 어떻게?
**A:** 로그인 없이 익명.
**Ambiguity:** 20% (Goal: 0.85, Constraints: 0.80, Criteria: 0.75)

</details>
