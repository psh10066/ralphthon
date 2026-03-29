import { NextResponse } from "next/server";

// 세션 데이터는 클라이언트 localStorage에서 관리됩니다.
// 이 API는 텔레그램 봇 등 서버사이드에서 필요할 때를 위한 stub입니다.
export async function GET() {
  return NextResponse.json({
    sessions: [],
    message: "세션 데이터는 클라이언트에서 관리됩니다.",
  });
}
