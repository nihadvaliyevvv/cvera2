import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ 
    message: "Successfully logged out",
    timestamp: new Date().toISOString()
  });
  
  // Clear all authentication cookies with various possible names
  const cookiesToClear = [
    "auth-token",
    "accessToken", 
    "refreshToken",
    "session",
    "token"
  ];
  
  cookiesToClear.forEach(cookieName => {
    response.cookies.set(cookieName, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0), // Expire immediately
    });
  });
  
  // Also clear for different paths
  response.cookies.set("auth-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api",
    maxAge: 0,
    expires: new Date(0),
  });
  
  // Add cache control headers to prevent caching
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  return response;
}
