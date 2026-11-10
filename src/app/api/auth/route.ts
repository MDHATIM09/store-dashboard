import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { pin } = await req.json();
    let correctPin = process.env.ADMIN_PIN || "7860";

    // Check database StoreSetting if configured
    try {
      if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("dummy")) {
        const setting = await prisma.storeSetting.findUnique({
          where: { id: "default" },
        });
        if (setting && setting.adminPin) {
          correctPin = setting.adminPin;
        }
      }
    } catch {
      // Fallback to env or default
    }

    if (String(pin).trim() === String(correctPin).trim()) {
      return NextResponse.json({ success: true, message: "Authorized" });
    }
    return NextResponse.json(
      { success: false, error: "Galat PIN! Kripya sahi PIN enter karein." },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Auth verification error" },
      { status: 500 }
    );
  }
}
