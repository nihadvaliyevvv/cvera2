import { NextRequest, NextResponse } from 'next/server';
import { scrapeOwnLinkedInProfile } from '@/lib/scraper/linkedin-scraper';
import { parseLinkedInData } from '@/lib/utils/parser';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ 
        success: false, 
        error: 'LinkedIn email və password tələb olunur' 
      }, { status: 400 });
    }

    console.log('🔐 Öz LinkedIn profil import edilir...');
    console.log('📧 Email:', email);

    // Login + öz profil scraping
    const profileData = await scrapeOwnLinkedInProfile(email, password);

    if (!profileData || !profileData.name) {
      return NextResponse.json({ 
        success: false, 
        error: 'Öz profil məlumatları tapılmadı. Login məlumatlarını yoxlayın.' 
      }, { status: 404 });
    }

    console.log('✅ Öz profil uğurla import edildi:', profileData.name);

    // Parse etdiyimiz məlumatları qaytaraq
    const parsedData = parseLinkedInData(profileData, '');

    return NextResponse.json({
      success: true,
      message: 'Öz LinkedIn profil məlumatları uğurla import edildi',
      data: parsedData,
      rawData: profileData,
      profileUrl: profileData.contactInfo?.linkedin || 'URL təyin edilmədi'
    });

  } catch (error) {
    console.error('❌ Öz profil import xətası:', error);
    
    return NextResponse.json({
      success: false,
      error: `Öz profil import uğursuz: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }, { status: 500 });
  }
}
