import { NextResponse } from "next/server";

// 프로필 데이터는 클라이언트 localStorage에서 관리됩니다.
export async function GET() {
  return NextResponse.json({
    essence: null,
    insights: [],
    keywords: [],
    message: "프로필 데이터는 클라이언트에서 관리됩니다.",
  });
}
