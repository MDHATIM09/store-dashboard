import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { pin } = await req.json();
    const correctPin = process.env.ADMIN_PIN || "1234";

    if (pin === correctPin) {
      return NextResponse.json({ success: true, message: "Authorized" });
    }
    return NextResponse.json({ success: false, error: "Incorrect PIN" }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, error: "Auth check failed" }, { status: 500 });
  }
}

