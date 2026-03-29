import { NextRequest, NextResponse } from "next/server";
import { groq, VISION_MODEL, TEXT_MODEL } from "@/lib/groq";

const SYSTEM_PROMPT = `당신은 사용자가 가져온 것(사진, 글, 링크, 메모)에서 취향과 패턴을 읽어보려는 시도를 합니다.

## 역할
사용자가 drop한 것을 받아서:
1. 관찰 — 무엇이 보이는지 사실만 말함
2. 분석 — "왜 이것에 끌렸는가"를 해석하되 "~일 수 있다" 톤으로
3. 질문 — 대화를 여는 한 마디. 확인이 아니라 가설.

당신은 이 사람을 모릅니다. 제한된 정보로 읽어본 것일 뿐입니다.
진단하지 않습니다. 관찰하고, 가설을 던질 뿐입니다.

## 입력 타입별 전략
- 사진: 뭐가 찍혀있는지 → 왜 이걸 골랐을지 → 질문
- 글/링크: 어떤 내용인지 → 뭐가 걸렸을지 → 질문
- 메모: 어떤 생각인지 → 왜 지금 이게 떠올랐을지 → 질문

## 출력 형식 (반드시 이 JSON만 출력)
{
  "headline": "인사이트 한 줄 (세리프 표시용, 관찰+분석 합친 핵심)",
  "observation": "관찰 사실 한두 문장",
  "firstQuestion": "대화를 여는 질문 한 마디",
  "topics": ["주제 태그 1~3개 (공간, 일, 사람, 취미, 여행, 음식 등)"],
  "styles": ["스타일 태그 1~3개 (고요한, 따뜻한, 묵직한, 빈티지, 미니멀, 느린 등)"],
  "palette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "connection": null
}

## 하지 않는 것
- 사진 내용을 단순 설명 ("카페 사진이네요")
- MBTI나 유형 분류
- 뻔한 칭찬 ("감성이 풍부하시네요")
- 오글거리는 표현
- JSON 외의 텍스트 출력`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { images, text, inputType } = body;

    const hasImage = images && Array.isArray(images) && images.length > 0 && images[0];
    const hasText = text && typeof text === "string" && text.trim();

    if (!hasImage && !hasText) {
      return NextResponse.json({ error: "입력이 필요합니다." }, { status: 400 });
    }

    const previousContext = body.previousInsights
      ? `\n\n## 이전 읽기에서 발견된 것들\n${JSON.stringify(body.previousInsights)}\n\n이전 읽기와 연결되는 부분이 있으면 connection 필드에 한 문장으로 적어주세요.`
      : "";

    let userContent: any[] = [];

    if (hasImage) {
      const img = images[0];
      const base64Url = img.startsWith("data:") ? img : `data:image/jpeg;base64,${img}`;
      userContent = [
        { type: "image_url", image_url: { url: base64Url } },
        { type: "text", text: "이 사진에서 취향을 읽어주세요. JSON만 출력하세요." },
      ];
    } else if (hasText) {
      const typeLabel = inputType === "link" ? "링크" : inputType === "memo" ? "메모" : "글";
      userContent = [
        { type: "text", text: `[${typeLabel} 입력]\n\n${text}\n\n이 내용에서 취향과 패턴을 읽어주세요. JSON만 출력하세요.` },
      ];
    }

    const model = hasImage ? VISION_MODEL : TEXT_MODEL;

    const response = await groq.chat.completions.create({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT + previousContext },
        { role: "user", content: userContent },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const responseText = response.choices[0]?.message?.content?.trim() || "";
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "다시 읽어볼게요..." }, { status: 500 });
    }

    const essence = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ essence });
  } catch (error: any) {
    console.error("Analyze error:", error);
    return NextResponse.json({ error: "다시 읽어볼게요...", details: error.message }, { status: 500 });
  }
}
