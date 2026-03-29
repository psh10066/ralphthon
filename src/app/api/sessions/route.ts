import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const { data: sessions, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const sessionsWithInsights = await Promise.all(
      (sessions || []).map(async (session: any) => {
        const { count } = await supabase
          .from("insights")
          .select("*", { count: "exact", head: true })
          .eq("session_id", session.id);

        const { data: topInsight } = await supabase
          .from("insights")
          .select("text")
          .eq("session_id", session.id)
          .limit(1)
          .single();

        return {
          id: session.id,
          date: session.created_at,
          inputType: session.input_type,
          inputPreview: session.input_preview,
          insightCount: count || 0,
          topInsight: topInsight?.text || null,
        };
      })
    );

    return NextResponse.json({ sessions: sessionsWithInsights });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
