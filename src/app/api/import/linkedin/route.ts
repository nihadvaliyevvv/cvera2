import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // LinkedIn import API subscription problemi var
  // "You are not subscribed to this API" xətası alınır
  // RapidAPI "Fresh LinkedIn Profile Data" servisinə subscription almaq lazımdır
  
  return NextResponse.json(
    {
      success: false,
      error: "LinkedIn import funksiyası üçün API subscription problemi var. RapidAPI-da 'Fresh LinkedIn Profile Data' servisinə abunə olmaq lazımdır.",
      details: "Hal-hazırda bütün API keylər üçün 403 Forbidden cavabı alınır."
    },
    { status: 503 }
  );
}

/* 
LinkedIn import funksiyasını yenidən aktivləşdirmək üçün:

1. RapidAPI.com saytına daxil olun
2. "Fresh LinkedIn Profile Data" API-ni tapın
3. Müvafiq subscription planı seçin və ödəniş edin
4. Bu faylı əsl LinkedIn import implementasiyası ilə əvəzləyin

Əsl implementasiya git history-də saxlanılıb
*/
