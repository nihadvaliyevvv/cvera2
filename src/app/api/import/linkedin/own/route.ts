import { NextRequest, NextResponse } from 'next/server';
import { scrapeOwnLinkedInProfile } from '@/lib/scraper/scrapingdog-linkedin-scraper';
import { parseLinkedInData } from '@/lib/utils/parser';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { linkedinId, linkedinUrl } = body;

    if (!linkedinId && !linkedinUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'LinkedIn ID və ya URL tələb olunur (məs: "musayevcreate" və ya "https://linkedin.com/in/musayevcreate")' 
      }, { status: 400 });
    }

    console.log('🔐 Öz LinkedIn profil import edilir...');
    
    let profileData;
    let profileUrl = '';

    if (linkedinUrl) {
      console.log('� LinkedIn URL istifadə olunur:', linkedinUrl);
      const { scrapeLinkedInProfile } = await import('@/lib/scraper/scrapingdog-linkedin-scraper');
      profileData = await scrapeLinkedInProfile(linkedinUrl);
      profileUrl = linkedinUrl;
    } else {
      console.log('🆔 LinkedIn ID istifadə olunur:', linkedinId);
      profileData = await scrapeOwnLinkedInProfile(linkedinId);
      profileUrl = `https://www.linkedin.com/in/${linkedinId}`;
    }

    if (!profileData || !profileData.name) {
      return NextResponse.json({ 
        success: false, 
        error: 'Öz profil məlumatları tapılmadı. LinkedIn ID/URL-ini yoxlayın.' 
      }, { status: 404 });
    }

    console.log('✅ Öz profil uğurla import edildi:', profileData.name);

    // Parse etdiyimiz məlumatları qaytaraq
    const parsedData = parseLinkedInData(profileData, profileUrl);

    return NextResponse.json({
      success: true,
      message: 'Öz LinkedIn profil məlumatları ScrapingDog API ilə uğurla import edildi',
      data: parsedData,
      rawData: profileData,
      profileUrl: profileUrl
    });

  } catch (error) {
    console.error('❌ Öz profil import xətası:', error);
    
    let errorMessage = 'Öz profil import uğursuz';
    
    if (error instanceof Error) {
      if (error.message.includes('LinkedIn profili tapılmadı')) {
        errorMessage = 'LinkedIn profili tapılmadı. ID/URL-ini yoxlayın';
      } else if (error.message.includes('API limiti')) {
        errorMessage = 'API limiti keçildi. Gözləyin və ya premium plan alın';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
    }, { status: 500 });
  }
}
