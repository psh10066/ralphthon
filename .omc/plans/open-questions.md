# Open Questions

## droppi-fullspec-plan - 2026-03-29
- [ ] users 테이블의 telegram_uid와 browser_session_id 병합 전략 -- 텔레그램 봇 + 웹 동시 사용 시 같은 사용자를 어떻게 연결할 것인지. 현재는 별개 식별자로 병행 처리하되, 추후 계정 연결 기능 필요
- [ ] 6축 제거 확정 여부 -- essence.md v2에서 6축이 제거되고 태그 시스템으로 변경됨. 그러나 funnel.md/screens.md에서 아직 "6축" 언급 존재. 최신 스펙(essence.md v2) 기준으로 6축 제거하고 태그만 사용하는 것으로 진행해도 되는지
- [ ] interactions.md 인증 섹션(0-6)과 deep-interview 결론 불일치 -- interactions.md는 텔레그램 로그인 위젯/WebApp initData를 언급하지만, deep-interview에서는 "로그인 없이 익명"으로 확정됨. 익명 우선으로 구현하되, 결과 저장 시 인증 요구 부분은 어떻게 처리할지
- [ ] Supabase Anonymous Auth 방식 선택 -- Supabase의 공식 Anonymous Auth 기능을 사용할지, 커스텀 세션 (localStorage UUID + service role key로 서버에서 처리)을 사용할지
