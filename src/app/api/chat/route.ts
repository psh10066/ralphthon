import { NextRequest, NextResponse } from "next/server";
import { groq, TEXT_MODEL } from "@/lib/groq";
import * as cheerio from "cheerio";

const DIALOGUE_SYSTEM_PROMPT = `당신은 사용자가 "왜 이게 좋은지" 스스로 발견하도록 돕는 대화 파트너입니다.
사람들은 자기가 뭘 좋아하는지는 알지만, 왜 좋아하는지는 모릅니다.
당신의 목적지는 "이게 나야?" 순간입니다.

## 대화의 방향
표면(뭐가 보이는지) → 깊이(왜 끌리는지) → 발견(그게 나에 대해 뭘 말하는지) → 연결(다른 것들과 닿는 패턴)

## 턴별 전략
| 턴 | 전략 |
|---|---|
| 1턴 | 관찰 사실 + 열린 질문. 가설 없이. |
| 2턴 | 사용자 응답 기반 가설 제시. |
| 3-5턴 | 깊이 파기. "왜?" → "그래서 뭘 알 수 있는데?" |
| 6턴+ | 연결 + 패턴 감지. |
| 8-10턴 | 자연스러운 정리 → 인사이트 카드 |

## 입력 타입별 첫 턴
- 사진(image): "왜 이 사진을 골랐을까"에 집중
- 글/링크(text/link): 요약하지 않는다. "걸리는 부분"을 물어본다
- 메모(memo): "이 생각이 왜 지금 떠올랐어?"

## 절대 하지 않는 것
1. 글을 요약하지 않는다
2. "좋은 글이네요" 같은 감상을 말하지 않는다
3. "당신은 이런 사람입니다" 진단하지 않는다
4. 한 번에 질문을 2개 이상 던지지 않는다
5. 사용자가 한 말을 AI 언어로 바꾸지 않는다
6. 이전 턴에서 이미 다룬 내용을 반복하지 않는다

## 질문 품질
- 안전한 확인 질문 3개보다 틀릴 수 있는 가설 1개
- 요약이 아니라 재프레이밍

## 발견(인사이트) 감지
- 사용자가 스스로 연결을 만들어낸 순간
- type을 "insight"로 설정하고 insight 객체를 포함

## 출력 형식 (반드시 이 JSON만 출력)
{
  "message": "대화 메시지",
  "type": "question" 또는 "insight",
  "insight": null 또는 { "text": "발견 내용", "tags": ["#태그1", "#태그2"], "connectedEssence": "선택" }
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
          const aiResult = await groq.chat.completions.create({
            model: TEXT_MODEL,
            messages: [{ role: "user", content: `이 URL의 글 내용을 아는 대로 요약해줘: ${url}. 모르면 "모름"이라고만 답해.` }],
            max_tokens: 500,
          });
          const researchText = aiResult.choices[0]?.message?.content || "모름";
          if (!researchText.includes("모름")) {
            processedContent = `[링크: ${url}]\n\n[AI 리서치 결과]\n${researchText}`;
          } else {
            return NextResponse.json({
              message: linkWarning ? `${linkWarning} 글의 핵심 부분을 붙여넣어볼래요?` : "이 링크를 읽기 어려워요. 글의 핵심 부분을 붙여넣어볼래요?",
              type: "question", insight: null,
            });
          }
        } catch {
          return NextResponse.json({ message: "이 링크를 읽기 어려워요. 글의 핵심 부분을 붙여넣어볼래요?", type: "question", insight: null });
        }
      }
    }

    const essenceContext = essence ? `\n\n## 사용자 에센스 프로필\n${JSON.stringify(essence, null, 2)}` : "";
    const insightContext = insightLog?.length > 0 ? `\n\n## 이전 대화에서 축적된 발견\n${JSON.stringify(insightLog, null, 2)}\n\n이전 발견과 연결되는 부분이 있으면 자연스럽게 언급해주세요.` : "";

    const historyMessages = (history || []).map((h: any) => ({
      role: h.role === "assistant" ? "assistant" as const : "user" as const,
      content: h.content,
    }));

    const turnCount = historyMessages.filter((m: any) => m.role === "user").length + 1;
    const turnContext = `\n\n## 현재 상태\n현재 ${turnCount}턴째입니다. 턴별 전략을 따르세요.`;

    const messages: any[] = [
      { role: "system", content: DIALOGUE_SYSTEM_PROMPT + essenceContext + insightContext + turnContext },
      ...historyMessages,
      { role: "user", content: `[입력 타입: ${input.type}]\n\n${processedContent}` },
    ];

    const response = await groq.chat.completions.create({
      model: TEXT_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const resultText = response.choices[0]?.message?.content?.trim() || "";
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (linkWarning && parsed.message && !parsed.message.includes(linkWarning)) {
          parsed.message = `(${linkWarning})\n\n${parsed.message}`;
        }
        return NextResponse.json({
          message: parsed.message || resultText,
          type: parsed.type || "question",
          insight: parsed.insight || null,
        });
      } catch { /* JSON 파싱 실패 */ }
    }

    return NextResponse.json({ message: resultText, type: "question", insight: null });
  } catch (error: any) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "다시 시도해주세요.", details: error.message }, { status: 500 });
  }
}
