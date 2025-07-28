import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// ScrapingDog API configuration (matching your instructions)
const SCRAPINGDOG_CONFIG = {
  api_key: '6882894b855f5678d36484c8',
  url: 'https://api.scrapingdog.com/linkedin',
  premium: 'false'
};

// Extract LinkedIn ID from various URL formats
function extractLinkIdFromUrl(linkedinUrl: string): string {
  if (!linkedinUrl) {
    throw new Error('LinkedIn URL tələb olunur');
  }

  const cleanUrl = linkedinUrl.trim();

  // If it's already just a username/ID (no URL), return it
  if (!cleanUrl.includes('/') && !cleanUrl.includes('linkedin.com')) {
    return cleanUrl;
  }

  // Handle various LinkedIn URL formats
  const patterns = [
    /linkedin\.com\/in\/([^\/\?&#]+)/i,
    /linkedin\.com\/pub\/([^\/\?&#]+)/i,
    /linkedin\.com\/profile\/view\?id=([^&]+)/i,
  ];

  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  throw new Error('LinkedIn URL formatı düzgün deyil');
}

export async function POST(request: NextRequest) {
  try {
    const { linkedinUrl, premium = false } = await request.json();

    if (!linkedinUrl) {
      return NextResponse.json(
        { error: 'LinkedIn URL tələb olunur' },
        { status: 400 }
      );
    }

    // LinkedIn URL-dən istifadəçi ID-sini çıxar
    let linkId: string;
    try {
      linkId = extractLinkIdFromUrl(linkedinUrl);
    } catch (error) {
      return NextResponse.json(
        { error: 'LinkedIn URL formatı düzgün deyil' },
        { status: 400 }
      );
    }

    console.log(`🔍 LinkedIn profil scraping: ${linkId}`);

    // ScrapingDog API call using your exact configuration
    const params = {
      api_key: SCRAPINGDOG_CONFIG.api_key,
      type: 'profile',
      linkId: linkId,
      premium: SCRAPINGDOG_CONFIG.premium,
    };

    const response = await axios.get(SCRAPINGDOG_CONFIG.url, {
      params: params,
      timeout: 30000
    });

    if (response.status !== 200) {
      console.log('Request failed with status code: ' + response.status);
      return NextResponse.json(
        { error: `API xətası: Status ${response.status}` },
        { status: response.status }
      );
    }

    const data = response.data;
    console.log('✅ LinkedIn profil uğurla əldə edildi:', data.name || 'Unknown');

    return NextResponse.json({
      success: true,
      data: data,
      message: 'LinkedIn profil uğurla scrape edildi'
    });

  } catch (error) {
    console.error('❌ LinkedIn scraper xətası:', error);

    let errorMessage = 'LinkedIn scraping zamanı xəta baş verdi';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Test ScrapingDog API connection
    const params = {
      api_key: SCRAPINGDOG_CONFIG.api_key,
      type: 'profile',
      linkId: 'musayevcreate', // Test profile as per your instructions
      premium: SCRAPINGDOG_CONFIG.premium,
    };

    const response = await axios.get(SCRAPINGDOG_CONFIG.url, {
      params: params,
      timeout: 10000
    });

    const isWorking = response.status === 200;

    return NextResponse.json({
      status: 'online',
      linkedin_api: isWorking ? 'working' : 'error',
      timestamp: new Date().toISOString(),
      message: 'LinkedIn scraper API hazırdır',
      api_provider: 'ScrapingDog'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'LinkedIn scraper API xətası',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
