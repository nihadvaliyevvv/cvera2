import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out." });
  response.cookies.set("refreshToken", "", {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
