import { NextRequest, NextResponse } from 'next/server';
import LinkedInScraper from '@/lib/scraper/linkedin-scraper';

export async function POST(request: NextRequest) {
  try {
    const { linkedinUrl, premium = false } = await request.json();

    if (!linkedinUrl) {
      return NextResponse.json(
        { error: 'LinkedIn URL tələb olunur' },
        { status: 400 }
      );
    }

    // LinkedIn URL-dən istifadəçi ID-sini çıxar (static method)
    let linkId: string;
    try {
      linkId = LinkedInScraper.extractLinkIdFromUrl(linkedinUrl);
    } catch (error) {
      return NextResponse.json(
        { error: 'LinkedIn URL formatı düzgün deyil' },
        { status: 400 }
      );
    }

    console.log('LinkedIn profil scraping başladı:', linkId);

    // LinkedIn profilini scrape et
    const scraper = new LinkedInScraper();
    const profile = await scraper.scrapeProfile(linkId, premium);

    return NextResponse.json({
      success: true,
      data: profile,
      message: 'LinkedIn profil məlumatları uğurla alındı'
    });

  } catch (error: any) {
    console.error('LinkedIn scraping xətası:', error);

    // API limitə çatma xətası
    if (error.message.includes('429') || error.message.includes('limit')) {
      return NextResponse.json({
        error: 'API limit aşıldı. Bir neçə dəqiqə sonra yenidən cəhd edin.',
        code: 'RATE_LIMIT_EXCEEDED'
      }, { status: 429 });
    }

    // Ümumi xəta
    return NextResponse.json({
      error: error.message || 'LinkedIn profil məlumatları alına bilmədi',
      code: 'SCRAPING_ERROR'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // API status check
    const scraper = new LinkedInScraper();
    const isWorking = await scraper.testConnection();

    return NextResponse.json({
      status: 'online',
      linkedin_api: isWorking ? 'working' : 'error',
      timestamp: new Date().toISOString(),
      message: 'LinkedIn scraper API hazırdır'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'LinkedIn scraper API xətası',
      error: error
    }, { status: 500 });
  }
}
