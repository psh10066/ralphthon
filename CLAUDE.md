# Ralphthon 2차 — AI Agent Integration Guide

## 참고 문서
- 세팅/배포/프로젝트 구조: [docs/setup.md](docs/setup.md)
- API 연동: [docs/api-reference.md](docs/api-reference.md)
- 딥링크: [docs/deeplinks.md](docs/deeplinks.md)

## 브라우저 API 스택
| 기능 | 사용 기술 |
|------|-----------|
| 마이크 입력 (STT) | Web Speech API - `SpeechRecognition` |
| AI 음성 출력 (TTS) | Web Speech API - `SpeechSynthesis` |

## 작업 규칙
- 외부 API 호출은 `src/lib/`에 모듈 분리
- API Route에서 try-catch 필수
- Supabase 저장 실패해도 핵심 기능은 동작해야 함
- 커밋 메시지는 한국어
- 테스트: Jest (단위) + Playwright (E2E)

## 구현 규칙 (Ralph 루프 진입 시 필수)
아래 규칙은 어떤 플랜이든 Ralph 루프로 구현을 시작하면 반드시 준수해야 한다.

### 반응형
- 모바일 앱 UI에서도 동작하는 반응형으로 구현

### 테스트
- 반드시 테스트 코드로 최대한 검증하면서 진행

### QA 절차
1. 개발 완료 후 **로컬에서 Playwright MCP로 모든 세부 기능을 하나하나 전부 확인**
2. 로컬 QA 통과 시 **Vercel에 배포**
3. 배포된 URL을 **다시 Playwright MCP로 접근하여 모든 세부 기능을 하나하나 재확인**
4. 문제가 약간이라도 있으면 수정 후 **QA 절차를 처음부터 다시 진행**
5. **문제가 아예 없어야 종료 가능**

### QA 세부 규칙
- 존재하는 **모든 메뉴와 모든 기능을 직접 눌러보고 검사**할 것
- 에러가 발생해서 고쳤다면, **다시 처음부터 모든 기능을 검사**할 것
- 모든 화면에서 **데이터가 없는 경우와 있는 경우를 모두 검토**하고 성공해야 한다
  - 데이터가 없다면 존재하도록 만들고, 잘 동작하는지 확인
