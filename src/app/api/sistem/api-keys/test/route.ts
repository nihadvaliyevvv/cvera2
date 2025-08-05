import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const prisma = new PrismaClient();

// Admin authentication middleware
async function authenticateAdmin(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId },
      select: { id: true, email: true, role: true, active: true }
    });

    if (!admin || !admin.active) {
      return null;
    }

    return admin;
  } catch (error) {
    return null;
  }
}

// Test API key functionality
export async function POST(request: NextRequest) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { apiKeyId } = body;

    if (!apiKeyId) {
      return NextResponse.json(
        { error: 'API key ID tələb olunur' },
        { status: 400 }
      );
    }

    // Get API key from database
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { id: apiKeyId }
    });

    if (!apiKeyRecord) {
      return NextResponse.json(
        { error: 'API key tapılmadı' },
        { status: 404 }
      );
    }

    let testResult;

    try {
      switch (apiKeyRecord.service) {
        case 'scrapingdog':
          testResult = await testScrapingDogAPI(apiKeyRecord.apiKey);
          break;
        case 'rapidapi':
          testResult = await testRapidAPI(apiKeyRecord.apiKey);
          break;
        case 'openai':
          testResult = await testOpenAI(apiKeyRecord.apiKey);
          break;
        default:
          throw new Error('Dəstəklənməyən service');
      }

      // Update API key record with test result
      await prisma.apiKey.update({
        where: { id: apiKeyId },
        data: {
          lastUsed: new Date(),
          lastResult: testResult.success ? 'SUCCESS' : 'FAILED',
          usageCount: { increment: 1 }
        }
      });

      return NextResponse.json({
        success: testResult.success,
        data: testResult,
        message: testResult.success ? 'API key işləyir' : 'API key işləmir'
      });

    } catch (error) {
      // Update with failed result
      await prisma.apiKey.update({
        where: { id: apiKeyId },
        data: {
          lastUsed: new Date(),
          lastResult: 'FAILED'
        }
      });

      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Test uğursuz',
        message: 'API key test edilə bilmədi'
      });
    }

  } catch (error) {
    console.error('API Key Test error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Test ScrapingDog API
async function testScrapingDogAPI(apiKey: string) {
  try {
    const response = await axios.get('https://api.scrapingdog.com/linkedin', {
      params: {
        api_key: apiKey,
        type: 'profile',
        linkId: 'musayevcreate',
        premium: 'false'
      },
      timeout: 10000
    });

    return {
      success: response.status === 200,
      status: response.status,
      data: response.data ? 'Data alındı' : 'Data boş',
      message: 'ScrapingDog API test edildi'
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        status: error.response?.status || 0,
        error: error.response?.data?.message || error.message,
        message: 'ScrapingDog API xətası'
      };
    }
    throw error;
  }
}

// Test RapidAPI
async function testRapidAPI(apiKey: string) {
  try {
    // Example RapidAPI endpoint test
    const response = await axios.get('https://fresh-linkedin-profile-data.p.rapidapi.com/get-linkedin-profile', {
      params: {
        linkedin_url: 'https://www.linkedin.com/in/musayevcreate',
        include_skills: 'false'
      },
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'fresh-linkedin-profile-data.p.rapidapi.com'
      },
      timeout: 10000
    });

    return {
      success: response.status === 200,
      status: response.status,
      data: response.data ? 'Data alındı' : 'Data boş',
      message: 'RapidAPI test edildi'
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        status: error.response?.status || 0,
        error: error.response?.data?.message || error.message,
        message: 'RapidAPI xətası'
      };
    }
    throw error;
  }
}

// Test OpenAI API
async function testOpenAI(apiKey: string) {
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Test' }],
      max_tokens: 5
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    return {
      success: response.status === 200,
      status: response.status,
      data: response.data ? 'Data alındı' : 'Data boş',
      message: 'OpenAI API test edildi'
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        status: error.response?.status || 0,
        error: error.response?.data?.error?.message || error.message,
        message: 'OpenAI API xətası'
      };
    }
    throw error;
  }
}
