# 랄프톤 — API 설계

---

## 웹앱 API (7개)

### POST `/api/analyze`

이미지 5장 → 에센스 분석.

```json
// 요청
{ "images": ["base64...", "base64...", "base64...", "base64...", "base64..."] }

// 응답
{
  "essence": {
    "headline": "손 닿는 곳의 아늑함을 모으는 사람",
    "dimensions": {
      "volume": { "label": "양감", "description": "채워진 둥근 볼륨" },
      "texture": { "label": "질감", "description": "도자기 유약, 나무결" },
      "opacity": { "label": "투명도", "description": "불투명. 빛을 품는 물질들" },
      "tactility": { "label": "촉각", "description": "따뜻하다" },
      "weight": { "label": "무게", "description": "탁자 위에 올려진 존재감" },
      "temperature": { "label": "온도", "description": "미지근 ~ 따뜻" }
    },
    "palette": ["#C4A882", "#D4A5A5", "#8FA68E", "#FAF6F1", "#3D3632"],
    "observation": "사진이 전부 가까이에 있는 것들이거든요.",
    "firstQuestion": "뭐가 끌렸어요 — 질감? 색감? 그때 기억?"
  }
}
```

### POST `/api/chat`

입력 + 에센스 + 히스토리 → 메타대화 질문 생성.

```json
// 요청
{
  "input": {
    "type": "image | text | link | memo",
    "content": "...",
    "url": "https://..."
  },
  "essence": { "..." },
  "history": [ "..." ]
}

// 응답 — 일반 질문
{
  "message": "이 글에서 뭐가 걸렸어요?",
  "type": "question",
  "insight": null
}

// 응답 — 발견 감지 시
{
  "message": "...",
  "type": "insight",
  "insight": {
    "text": "준비 안 된 채로 꺼내는 연습이 필요해",
    "tags": ["#완성", "#속도"],
    "connectedEssence": "volume"
  }
}
```

### GET `/api/profile`

에센스 + 인사이트 + 키워드 + 변화 이력.

```json
{
  "essence": { "..." },
  "essenceHistory": [
    { "date": "2026-03-25", "headline": "...", "dimensions": { "..." } }
  ],
  "insights": [ "..." ],
  "keywords": ["#완성", "#혼자", "#속도"],
  "topography": { "..." }
}
```

### GET `/api/sessions`

세션 목록.

```json
{
  "sessions": [
    {
      "id": "session_001",
      "date": "2026-03-28",
      "inputType": "image",
      "inputPreview": "풍경 사진",
      "insightCount": 2,
      "topInsight": "넓은 곳이 필요한 상태"
    }
  ]
}
```

### GET `/api/sessions/:id`

세션 상세 — 대화 전문 + 발견 + 패턴.

```json
{
  "id": "session_001",
  "date": "2026-03-28",
  "messages": [ "..." ],
  "insights": [
    {
      "text": "넓은 곳이 필요한 상태",
      "tags": ["#공간", "#상태"],
      "connectedEssence": "volume"
    }
  ],
  "confirmedPatterns": ["공간 감각과 심리 상태의 연결"]
}
```

### POST `/api/share`

공유용 이미지 생성.

```json
// 요청
{ "essence": { "..." }, "format": "kakao | instagram" }

// 응답
{
  "imageUrl": "https://...",
  "kakaoShare": {
    "title": "손 닿는 곳의 아늑함을 모으는 사람",
    "description": "사진 5장으로 읽은 나의 취향 에센스",
    "imageUrl": "https://...",
    "link": "https://..."
  }
}
```

### GET `/api/topography`

축적 지형도 데이터.

```json
{
  "clusters": [
    {
      "id": "closing",
      "label": "닫는 것",
      "height": 5,
      "insights": ["...", "...", "...", "...", "..."],
      "keywords": ["#완성", "#마무리"]
    },
    {
      "id": "alone",
      "label": "혼자",
      "height": 3,
      "insights": ["...", "...", "..."],
      "keywords": ["#혼자", "#충전"]
    }
  ],
  "totalInsights": 12,
  "lastUpdated": "2026-03-28"
}
```

---

## 텔레그램 봇 API

### Webhook 수신

텔레그램에서 사용자가 보낸 메시지를 받아 처리한다.

```
POST /api/telegram/webhook
```

**입력 종류별 처리:**

| 입력 | 처리 |
|------|------|
| 사진 | 이미지 다운로드 → `/api/chat` 호출 (type: image) |
| 텍스트 | 텍스트 추출 → `/api/chat` 호출 (type: text or memo) |
| 링크 | URL 감지 → `/api/chat` 호출 (type: link) |

**흐름:**

```
사용자 → 텔레그램 메시지 전송
  → Webhook 수신
  → 입력 타입 판별 (사진/텍스트/링크)
  → /api/chat 호출 (essence + history 포함)
  → 질문 메시지 → 텔레그램으로 전송
```

### 응답 전송

일반 질문이면 텍스트 메시지로 전송.

인사이트 감지 시:

```
"발견이 있어요!

'준비 안 된 채로 꺼내는 연습이 필요해'

웹에서 더 자세히 확인해보세요 👉 https://ralphton.vercel.app/profile"
```

### 첫 진입 (온보딩)

에센스가 없는 사용자가 처음 메시지를 보내면:

```
"반가워요! 먼저 당신의 에센스를 알아볼까요?
끌리는 사진 5장을 보내주세요. 예쁠 필요 없어요."
```

5장 수신 완료 시 → `/api/analyze` 호출 → 에센스 결과 텍스트로 전송 + 웹 링크.
