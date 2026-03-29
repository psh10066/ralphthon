# Ralphthon 2차 — AI Agent Integration Guide

## 참고 문서
- 세팅/배포/프로젝트 구조: [docs/setup.md](docs/setup.md)
- API 연동: [docs/api-reference.md](docs/api-reference.md)
- 딥링크: [docs/deeplinks.md](docs/deeplinks.md)

## 작업 규칙
- 외부 API 호출은 `src/lib/`에 모듈 분리
- API Route에서 try-catch 필수
- Supabase 저장 실패해도 핵심 기능은 동작해야 함
- 커밋 메시지는 한국어
- 테스트: Jest (단위) + Playwright (E2E)
