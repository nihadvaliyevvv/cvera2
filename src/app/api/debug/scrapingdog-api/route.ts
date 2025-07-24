import { NextRequest, NextResponse } from 'next/server';
import { checkScrapingDogApiStatus } from '@/lib/scraper/scrapingdog-linkedin-scraper';

export async function GET(req: NextRequest) {
  try {
    console.log('📡 ScrapingDog API status yoxlanır...');

    const status = await checkScrapingDogApiStatus();

    console.log('✅ API status əldə edildi:', status);

    return NextResponse.json({
      success: true,
      message: 'ScrapingDog API status uğurla yoxlandı',
      data: {
        status: status.status,
        remaining_requests: status.remaining_requests,
        message: status.message,
        timestamp: new Date().toISOString(),
        api_provider: 'ScrapingDog',
        api_endpoint: 'https://api.scrapingdog.com/linkedin'
      }
    });

  } catch (error) {
    console.error('❌ API status yoxlama xətası:', error);

    return NextResponse.json({
      success: false,
      error: `API status yoxlama uğursuz: ${error instanceof Error ? error.message : 'Unknown error'}`,
      data: {
        status: 'error',
        timestamp: new Date().toISOString(),
        api_provider: 'ScrapingDog'
      }
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // POST method ilə detallı API test
  try {
    const body = await req.json();
    const { testProfile = 'musayevcreate' } = body;

    console.log(`📡 ScrapingDog API detallı test edilir: ${testProfile}`);

    // API status yoxla
    const status = await checkScrapingDogApiStatus();
    
    if (status.status !== 'active') {
      return NextResponse.json({
        success: false,
        error: 'API aktiv deyil',
        data: status
      }, { status: 503 });
    }

    // Test profili scrape et
    const { scrapeOwnLinkedInProfile } = await import('@/lib/scraper/scrapingdog-linkedin-scraper');
    const profileData = await scrapeOwnLinkedInProfile(testProfile);

    return NextResponse.json({
      success: true,
      message: 'ScrapingDog API detallı test uğurla tamamlandı',
      data: {
        api_status: status,
        test_profile: {
          linkedin_id: testProfile,
          name: profileData.name,
          headline: profileData.headline,
          location: profileData.location,
          experience_count: profileData.experience?.length || 0,
          education_count: profileData.education?.length || 0,
          skills_count: profileData.skills?.length || 0,
          has_profile_image: !!profileData.profileImage,
          has_contact_info: !!profileData.contactInfo?.email
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ API detallı test xətası:', error);

    return NextResponse.json({
      success: false,
      error: `API detallı test uğursuz: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
