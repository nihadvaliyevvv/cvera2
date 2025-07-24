import { NextRequest, NextResponse } from 'next/server';
import { scrapeLinkedInProfile } from '@/lib/scraper/linkedin-scraper';
import { parseLinkedInData } from '@/lib/utils/parser';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, email, password } = body;

    if (!url) {
      return NextResponse.json({ 
        success: false, 
        error: 'LinkedIn profil URL-i tələb olunur' 
      }, { status: 400 });
    }

    console.log('🔍 HTML Scraper ilə LinkedIn profil import edilir:', url);
    if (email && password) {
      console.log('🔐 Login məlumatları ilə import ediləcək');
    }

    // HTML scraper istifadə edərək profil məlumatlarını çəkək
    const profileData = await scrapeLinkedInProfile(url, email, password);

    if (!profileData || !profileData.name) {
      return NextResponse.json({ 
        success: false, 
        error: 'Profil məlumatları tapılmadı. Profilin ictimai olduğundan əmin olun.' 
      }, { status: 404 });
    }

    console.log('✅ HTML Scraper ilə profil uğurla import edildi:', profileData.name);

    // Data strukturunu komponentin gözlədiyi formata çevir
    const transformedData = parseLinkedInData(profileData, url);

    return NextResponse.json({ 
      success: true, 
      data: transformedData,
      message: `LinkedIn profiliniz HTML scraping ilə uğurla import edildi! 🎉`
    });

  } catch (error) {
    console.error('❌ HTML Scraper xətası:', error);
    
    let errorMessage = 'HTML scraping zamanı xəta baş verdi';
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid LinkedIn profile URL')) {
        errorMessage = 'LinkedIn profil URL-i düzgün deyil';
      } else if (error.message.includes('Browser initialization failed')) {
        errorMessage = 'Brauzer başlatmaq mümkün olmadı. Puppeteer quraşdırılmayıb.';
      } else if (error.message.includes('Failed to scrape profile')) {
        errorMessage = 'Profil məlumatları çəkilə bilmədi. Profil ictimai olmaya bilər və ya LinkedIn anti-bot müdafiəsi aktivdir.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Səhifə yüklənməsi çox vaxt aldı. Yenidən cəhd edin.';
      }
    }

    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}
