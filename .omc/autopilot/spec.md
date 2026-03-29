# AI 취향 분석 & 선물 추천 서비스 스펙

## 서비스 개요
사용자가 AI(Claude)와 대화하며 자신의 취향을 분석받고, 맞춤형 선물 추천을 받는 웹 서비스.
음성 입력(STT)과 AI 음성 응답(TTS) 지원.

## 핵심 기능

### 1. AI 채팅 (취향 분석)
- Claude API를 통해 사용자와 대화
- 대화를 통해 취향 키워드 추출 (예: "미니멀", "자연", "테크")
- 시스템 프롬프트: 취향 분석 전문가 역할
- 대화 기록 Supabase 저장

### 2. 선물 추천
- AI가 추출한 키워드 기반 선물 추천
- 네이버 쇼핑 딥링크
- 카카오톡 선물하기 딥링크
- 추천 카드 UI (이미지 + 상품명 + 링크)

### 3. 음성 인터페이스
- STT: Web Speech API `SpeechRecognition` - 마이크로 질문
- TTS: Web Speech API `SpeechSynthesis` - AI 응답 읽어주기

### 4. 알림 연동
- Discord: 취향 분석 완료 시 결과 공유
- Telegram: 추천 결과 전송

## 기술 스택
- Next.js 14 (App Router), TypeScript, React 18
- Tailwind CSS v4
- Supabase (PostgreSQL)
- Vercel 배포
- Claude API (@anthropic-ai/sdk)

## DB 스키마 (ralphthon_gift 스키마)
```sql
CREATE SCHEMA IF NOT EXISTS ralphthon_gift;

CREATE TABLE ralphthon_gift.conversations (
  id bigint generated always as identity primary key,
  session_id text not null,
  user_message text not null,
  ai_response text not null,
  keywords jsonb,
  created_at timestamptz default now()
);

CREATE TABLE ralphthon_gift.recommendations (
  id bigint generated always as identity primary key,
  session_id text not null,
  keywords jsonb not null,
  gifts jsonb not null,
  created_at timestamptz default now()
);
```

## 페이지 구조
- `/` - 메인: 채팅 UI + 선물 추천 결과

## API Routes
- `POST /api/chat` - Claude 대화 (취향 분석)
- `POST /api/db/init` - DB 스키마 초기화
- `POST /api/notifications/discord` - Discord 알림
- `POST /api/notifications/telegram` - Telegram 알림
