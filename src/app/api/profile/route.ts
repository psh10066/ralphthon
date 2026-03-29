import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const [essenceRes, insightsRes, clustersRes] = await Promise.all([
      supabase
        .from("essence_profiles")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from("insights")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("topography_clusters")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false }),
    ]);

    const essenceHistory = await supabase
      .from("essence_profiles")
      .select("headline, dimensions, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const allTags = (insightsRes.data || []).flatMap((i: any) => i.tags || []);
    const tagCounts = allTags.reduce((acc: Record<string, number>, tag: string) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});
    const keywords = Object.entries(tagCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([tag]) => tag);

    return NextResponse.json({
      essence: essenceRes.data || null,
      essenceHistory: essenceHistory.data || [],
      insights: insightsRes.data || [],
      clusters: clustersRes.data || [],
      keywords,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
