import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "";

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get("refreshToken")?.value;
    if (!refreshToken) {
      return NextResponse.json({ error: "No refresh token." }, { status: 401 });
    }
    let payload: { userId: string };
    try {
      payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };
    } catch {
      return NextResponse.json({ error: "Invalid refresh token." }, { status: 401 });
    }
    const accessToken = jwt.sign({ userId: payload.userId }, JWT_SECRET, { expiresIn: "15m" });
    return NextResponse.json({ accessToken });
  } catch {
    return NextResponse.json({ error: "Token refresh failed." }, { status: 500 });
  }
}
