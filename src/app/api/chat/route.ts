import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";
import * as cheerio from "cheerio";

const DIALOGUE_SYSTEM_PROMPT = `당신은 입력을 요약하지 않고 질문하는 대화 파트너입니다.
사용자의 에센스 프로필과 대화 히스토리를 바탕으로,
사진/글/메모/링크에서 자기 이해로 이어지는 질문을 던집니다.

## 절대 하지 않는 것
1. 글을 요약하지 않는다
2. "좋은 글이네요" 같은 감상을 말하지 않는다
3. "당신은 이런 사람입니다" 진단하지 않는다
4. 한 번에 질문을 2개 이상 던지지 않는다
5. 사용자가 한 말을 AI 언어로 바꾸지 않는다

## 입력 타입별 분기
사진(image): "왜 이 사진을 골랐을까"에 집중. 구체적 질문.
글/링크(text/link): 요약하지 않는다. "걸리는 부분"을 물어본다.
메모(memo): "이 생각이 왜 지금 떠올랐어?"로 시작.

## 반드시 하는 것
1. 입력 타입에 따라 다른 질문으로 시작
2. 질문에 가설을 붙인다
3. "왜?"에서 멈추지 않고 "그래서 뭘 알 수 있는데?"까지
4. 에센스 연결은 자연스러울 때만 (3턴 이후)
5. 발견 시 사용자의 말 그대로 요약 + 저장 제안

## 질문 품질
- 안전한 확인 질문 3개보다 틀릴 수 있는 가설 1개
- 이미 정리한 내용을 다시 묻지 않는다

## 발견(인사이트) 감지
- "아, 그래서 그랬구나" 류의 깨달음이 보이면
- type을 "insight"로 설정하고 insight 객체를 포함

## 출력 형식 (반드시 이 JSON만 출력)
{
  "message": "대화 메시지",
  "type": "question" 또는 "insight",
  "insight": null 또는 { "text": "발견 내용", "tags": ["#태그1", "#태그2"], "connectedEssence": "volume 등 (선택)" }
}`;

const RESTRICTED_DOMAINS = ["linkedin.com", "instagram.com", "facebook.com"];

async function scrapeUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Droppi/1.0)" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);
    $("script, style, nav, footer, header, aside").remove();
    const text = $("article, main, .content, .post, body")
      .first()
      .text()
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 3000);
    return text || null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input, essence, history, insightLog } = body;

    if (!input || !input.content) {
      return NextResponse.json({ message: "입력이 필요해요.", type: "question", insight: null });
    }

    let processedContent = input.content;
    let linkWarning: string | null = null;

    if (input.type === "link") {
      const url = input.content;
      const domain = new URL(url).hostname;

      if (RESTRICTED_DOMAINS.some((d) => domain.includes(d))) {
        linkWarning = `${domain}은 직접 읽기 어려운 사이트예요.`;
      }

      const scraped = await scrapeUrl(url);
      if (scraped) {
        processedContent = `[링크: ${url}]\n\n${scraped}`;
      } else {
        try {
          const aiResearch = await anthropic.messages.create({
            model: "claude-opus-4-20250514",
            max_tokens: 500,
            messages: [
              {
                role: "user",
                content: `이 URL의 글 내용을 아는 대로 요약해줘: ${url}. 모르면 "모름"이라고만 답해.`,
              },
            ],
          });
          const researchText = aiResearch.content[0];
          if (researchText.type === "text" && !researchText.text.includes("모름")) {
            processedContent = `[링크: ${url}]\n\n[AI 리서치 결과]\n${researchText.text}`;
          } else {
            return NextResponse.json({
              message: linkWarning
                ? `${linkWarning} 글의 핵심 부분을 붙여넣어볼래요?`
                : "이 링크를 읽기 어려워요. 글의 핵심 부분을 붙여넣어볼래요?",
              type: "question",
              insight: null,
            });
          }
        } catch {
          return NextResponse.json({
            message: "이 링크를 읽기 어려워요. 글의 핵심 부분을 붙여넣어볼래요?",
            type: "question",
            insight: null,
          });
        }
      }
    }

    const essenceContext = essence
      ? `\n\n## 사용자 에센스 프로필\n${JSON.stringify(essence, null, 2)}`
      : "";

    const insightContext = insightLog && insightLog.length > 0
      ? `\n\n## 이전 대화에서 축적된 발견\n${JSON.stringify(insightLog, null, 2)}\n\n이전 발견과 연결되는 부분이 있으면 자연스럽게 언급해주세요.`
      : "";

    const messages = [
      ...(history || []).map((h: any) => ({
        role: h.role as "user" | "assistant",
        content: h.content,
      })),
      {
        role: "user" as const,
        content: `[입력 타입: ${input.type}]\n\n${processedContent}`,
      },
    ];

    const response = await anthropic.messages.create({
      model: "claude-opus-4-20250514",
      max_tokens: 1000,
      temperature: 0.7,
      system: DIALOGUE_SYSTEM_PROMPT + essenceContext + insightContext,
      messages,
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "AI 응답 오류" }, { status: 500 });
    }

    let resultText = textBlock.text.trim();
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (linkWarning && !parsed.message.includes(linkWarning)) {
        parsed.message = `(${linkWarning})\n\n${parsed.message}`;
      }
      return NextResponse.json(parsed);
    }

    return NextResponse.json({
      message: resultText,
      type: "question",
      insight: null,
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "다시 시도해주세요.", details: error.message },
      { status: 500 }
    );
  }
}
