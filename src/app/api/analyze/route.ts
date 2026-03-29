import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";

const SYSTEM_PROMPT = `당신은 사진에서 취향의 에센스를 읽어보려는 시도를 합니다.

## 역할
사진 N장을 받아서 "이 사람은 왜 이것들에 끌렸는가"를 6축으로 읽어봅니다.
당신은 이 사람을 모릅니다. 사진이라는 제한된 정보로 읽어본 것일 뿐입니다.
진단하지 않습니다. 관찰하고, 가설을 던질 뿐입니다.

## 분석 순서

### Step 1: 개별 사진 분석
각 사진에서 지배적 색감(hex), 공간감, 질감, 빛, 무드 키워드 3개를 읽으세요.

### Step 2: 교집합 추출
"내용물"이 아니라 "선택의 공통점"을 찾으세요.
나쁜 교집합: "카페 사진이 많다"
좋은 교집합: "낮은 조도, 나무 질감, 혼자 앉을 수 있는 구석"

### Step 3: 6축 에센스
양감/질감/투명도/촉각/무게/온도. 형용사가 아니라 장면으로 표현.

### Step 4: 컬러 팔레트
전체 사진의 톤을 대표하는 지배색 5개 (hex).

### Step 5: 에센스 한 줄
15~20자. 시적이되 모호하지 않게.
나쁜 예: "따뜻한 사람" / 좋은 예: "손 닿는 곳의 아늑함을 모으는 사람"

### Step 6: 가설 질문
사진에서 읽은 패턴을 바탕으로 가설을 던지세요.
"~아닌가요?" 형태. 틀려도 되지만 찔러야 합니다.

## 사진 수에 따른 분석 깊이
- 1장: 기본 분석. 교집합 없이 단일 사진에서 6축 추출. 가설은 조심스럽게.
- 2~3장: 교집합 시도. 공통점이 보이면 추출, 아니면 각각의 특징을 종합.
- 4~5장: 풀 분석. 교집합 추출 필수. 가설에 확신을 좀 더.

## 출력 형식 (반드시 이 JSON만 출력)
{
  "headline": "에센스 한 줄",
  "dimensions": {
    "volume": { "label": "양감", "description": "..." },
    "texture": { "label": "질감", "description": "..." },
    "opacity": { "label": "투명도", "description": "..." },
    "tactility": { "label": "촉각", "description": "..." },
    "weight": { "label": "무게", "description": "..." },
    "temperature": { "label": "온도", "description": "..." }
  },
  "palette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "observation": "사진에서 읽은 관찰 사실 한 문장",
  "firstQuestion": "가설 질문"
}

## 하지 않는 것
- 사진 내용을 설명하지 않음 ("카페 사진이네요")
- MBTI나 유형 분류로 환원하지 않음
- 뻔한 칭찬을 하지 않음 ("감성이 풍부하시네요")
- 오글거리는 표현 금지
- JSON 외의 텍스트를 출력하지 않음`;

export async function POST(request: NextRequest) {
  try {
    const { images } = await request.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "최소 1장의 이미지가 필요합니다." },
        { status: 400 }
      );
    }

    if (images.length > 5) {
      return NextResponse.json(
        { error: "최대 5장까지 가능합니다." },
        { status: 400 }
      );
    }

    const imageContent = images.map((img: string) => {
      const base64Data = img.replace(/^data:image\/\w+;base64,/, "");
      const mediaType = img.match(/^data:(image\/\w+);base64,/)?.[1] || "image/jpeg";
      return {
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
          data: base64Data,
        },
      };
    });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      temperature: 0.3,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            ...imageContent,
            {
              type: "text" as const,
              text: `이 사진 ${images.length}장에서 취향의 에센스를 읽어주세요. JSON만 출력하세요.`,
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "AI 응답에서 텍스트를 찾을 수 없습니다." },
        { status: 500 }
      );
    }

    let essenceText = textBlock.text.trim();
    const jsonMatch = essenceText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "다시 읽어볼게요...", retry: true },
        { status: 500 }
      );
    }

    const essence = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ essence });
  } catch (error: any) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      { error: "다시 읽어볼게요...", details: error.message },
      { status: 500 }
    );
  }
}
