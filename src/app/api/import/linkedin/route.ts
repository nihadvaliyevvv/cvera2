import { NextRequest, NextResponse } from 'next/server';
import { scrapeLinkedInProfile } from '@/lib/scraper/scrapingdog-linkedin-scraper';
import { parseLinkedInData } from '@/lib/utils/parser';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ 
        success: false, 
        error: 'LinkedIn profil URL-i tələb olunur' 
      }, { status: 400 });
    }

    console.log('🔍 ScrapingDog API ilə LinkedIn profil import edilir:', url);

    // ScrapingDog API istifadə edərək profil məlumatlarını çəkək
    const profileData = await scrapeLinkedInProfile(url);

    if (!profileData || !profileData.name) {
      return NextResponse.json({ 
        success: false, 
        error: 'Profil məlumatları tapılmadı. LinkedIn ID və ya URL düzgün olmaya bilər.' 
      }, { status: 404 });
    }

    console.log('✅ ScrapingDog API ilə profil uğurla import edildi:', profileData.name);

    // Data strukturunu komponentin gözlədiyi formata çevir
    const transformedData = parseLinkedInData(profileData, url);

    return NextResponse.json({ 
      success: true, 
      data: transformedData,
      message: `LinkedIn profiliniz ScrapingDog API ilə uğurla import edildi! 🎉`
    });

  } catch (error) {
    console.error('❌ ScrapingDog API xətası:', error);
    
    let errorMessage = 'LinkedIn scraping zamanı xəta baş verdi';
    
    if (error instanceof Error) {
      if (error.message.includes('Keçersiz LinkedIn URL formatı')) {
        errorMessage = 'LinkedIn profil URL-i düzgün formatda deyil';
      } else if (error.message.includes('API açarı yanlışdır')) {
        errorMessage = 'API açarı problemi var';
      } else if (error.message.includes('API limitiniz bitib')) {
        errorMessage = 'API limiti keçildi. Premium plan lazımdır';
      } else if (error.message.includes('LinkedIn profili tapılmadı')) {
        errorMessage = 'LinkedIn profili tapılmadı və ya mövcud deyil';
      } else if (error.message.includes('API limiti keçildi')) {
        errorMessage = 'API rate limiti keçildi. Bir az gözləyin';
      } else if (error.message.includes('əlaqə yaradıla bilmədi')) {
        errorMessage = 'İnternet bağlantısı problemi';
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}
