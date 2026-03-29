import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage, getFileUrl } from "@/lib/telegram";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = body.message;
    if (!message) return NextResponse.json({ ok: true });

    const chatId = String(message.chat.id);
    const telegramUid = String(message.from.id);
    const text = message.text || "";

    // /start WEB_{sessionId} 처리
    if (text.startsWith("/start WEB_")) {
      const webSessionId = text.replace("/start WEB_", "").trim();
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("telegram_uid", telegramUid)
        .single();

      if (existingUser) {
        await supabase
          .from("users")
          .update({ web_session_id: webSessionId })
          .eq("id", existingUser.id);
      } else {
        await supabase.from("users").insert({
          telegram_uid: telegramUid,
          web_session_id: webSessionId,
        });
      }

      await sendTelegramMessage(chatId, "연결됐어요. 웹에서 저장한 것들이 여기서도 보여요.");
      return NextResponse.json({ ok: true });
    }

    // 사용자 확인/생성
    let { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("telegram_uid", telegramUid)
      .single();

    if (!user) {
      const { data: newUser } = await supabase
        .from("users")
        .insert({ telegram_uid: telegramUid })
        .select("id")
        .single();
      user = newUser;
    }

    if (!user) {
      await sendTelegramMessage(chatId, "문제가 생겼어요. 다시 시도해주세요.");
      return NextResponse.json({ ok: true });
    }

    // 에센스 확인
    const { data: essence } = await supabase
      .from("essence_profiles")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // 사진 처리
    if (message.photo) {
      const photo = message.photo[message.photo.length - 1];
      const fileUrl = await getFileUrl(photo.file_id);
      const imgRes = await fetch(fileUrl);
      const buffer = Buffer.from(await imgRes.arrayBuffer());
      const base64 = `data:image/jpeg;base64,${buffer.toString("base64")}`;

      if (!essence) {
        // 에센스 없음 → 분석
        const host = request.headers.get("host") || "localhost:3000";
        const protocol = host.includes("localhost") ? "http" : "https";
        const analyzeRes = await fetch(`${protocol}://${host}/api/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ images: [base64] }),
        });
        const analyzeData = await analyzeRes.json();

        if (analyzeData.essence) {
          await supabase.from("essence_profiles").insert({
            user_id: user.id,
            headline: analyzeData.essence.headline,
            dimensions: analyzeData.essence.dimensions,
            palette: analyzeData.essence.palette,
            observation: analyzeData.essence.observation,
            first_question: analyzeData.essence.firstQuestion,
            raw_images: [base64],
          });

          await sendTelegramMessage(
            chatId,
            `"${analyzeData.essence.headline}"\n\n${analyzeData.essence.firstQuestion}`
          );
        }
        return NextResponse.json({ ok: true });
      }

      // 에센스 있음 → 대화
      const host = request.headers.get("host") || "localhost:3000";
      const protocol = host.includes("localhost") ? "http" : "https";
      const chatRes = await fetch(`${protocol}://${host}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { type: "image", content: base64 },
          essence,
          history: [],
        }),
      });
      const chatData = await chatRes.json();

      let replyText = chatData.message;
      if (chatData.type === "insight" && chatData.insight) {
        const webUrl = `${protocol}://${host}/profile`;
        replyText += `\n\n발견이 있어요!\n"${chatData.insight.text}"\n\n웹에서 더 자세히 확인해보세요 → ${webUrl}`;
      }

      await sendTelegramMessage(chatId, replyText);
      return NextResponse.json({ ok: true });
    }

    // 텍스트 처리
    if (text && !text.startsWith("/")) {
      if (!essence) {
        await sendTelegramMessage(
          chatId,
          "반가워요! 먼저 당신의 에센스를 알아볼까요?\n끌리는 사진을 보내주세요. 예쁠 필요 없어요."
        );
        return NextResponse.json({ ok: true });
      }

      const isLink = /^https?:\/\//.test(text);
      const inputType = isLink ? "link" : "text";

      const host = request.headers.get("host") || "localhost:3000";
      const protocol = host.includes("localhost") ? "http" : "https";
      const chatRes = await fetch(`${protocol}://${host}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { type: inputType, content: text },
          essence,
          history: [],
        }),
      });
      const chatData = await chatRes.json();

      let replyText = chatData.message;
      if (chatData.type === "insight" && chatData.insight) {
        const webUrl = `${protocol}://${host}/profile`;
        replyText += `\n\n발견이 있어요!\n"${chatData.insight.text}"\n\n웹에서 확인해보세요 → ${webUrl}`;
      }

      await sendTelegramMessage(chatId, replyText);
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}
