import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Test API key with your code sample
export async function POST(request: NextRequest) {
    try {
        // Verify admin authentication
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({error: 'Unauthorized'}, {status: 401});
        }

        const token = authHeader.substring(7);
        const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
        const JWT_ADMIN_SECRET = process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET || 'fallback_secret_key';

        let decoded;
        try {
            decoded = jwt.verify(token, JWT_ADMIN_SECRET) as any;
        } catch {
            decoded = jwt.verify(token, JWT_SECRET) as any;
        }

        if (!(decoded.role === 'admin' || decoded.role === 'ADMIN' || decoded.role === 'SUPER_ADMIN' || decoded.isAdmin || decoded.adminId)) {
            return NextResponse.json({error: 'Admin icazəniz yoxdur'}, {status: 403});
        }

        const {apiKey, service} = await request.json();

        if (!apiKey || !service) {
            return NextResponse.json({
                success: false,
                error: 'API key və service tələb olunur'
            }, {status: 400});
        }

        // Test ScrapingDog API with your exact code
        if (service === 'scrapingdog') {
            const axios = require('axios');

            const url = 'https://api.scrapingdog.com/linkedin';
            const params = {
                api_key: apiKey,
                type: 'profile',
                linkId: 'musayevcreate',
                premium: 'false',
            };

            try {
                // First check account status
                const accountResponse = await axios.get('https://api.scrapingdog.com/account', {
                    params: {api_key: apiKey},
                    timeout: 10000
                });

                const accountData = accountResponse.data;
                const remaining = accountData.requestLimit - accountData.requestUsed;

                if (remaining <= 0) {
                    return NextResponse.json({
                        success: false,
                        error: 'API limit tükənib',
                        details: {
                            used: accountData.requestUsed,
                            limit: accountData.requestLimit,
                            remaining: remaining,
                            pack: accountData.pack
                        }
                    });
                }

                // Test LinkedIn API call
                const response = await axios.get(url, {
                    params: params,
                    timeout: 15000
                });

                if (response.status === 200) {
                    return NextResponse.json({
                        success: true,
                        message: 'API key işləyir!',
                        details: {
                            status: response.status,
                            remaining: remaining,
                            pack: accountData.pack,
                            profileDataReceived: !!response.data,
                            dataKeys: Object.keys(response.data || {})
                        }
                    });
                } else {
                    return NextResponse.json({
                        success: false,
                        error: `API request failed: ${response.status}`,
                        details: {status: response.status}
                    });
                }

            } catch (error: any) {
                if (error.message?.includes('Unexpected token')) {
                    return NextResponse.json({
                        success: false,
                        error: 'JSON parse xətası - API HTML qaytarır',
                        details: {
                            issue: 'API key səhvdir və ya limit tükənib',
                            solution: 'Yeni API key alın'
                        }
                    });
                }

                return NextResponse.json({
                    success: false,
                    error: error.message || 'Test uğursuz',
                    details: {
                        code: error.code,
                        status: error.response?.status
                    }
                });
            }
        }

        // Test other services (placeholder)
        return NextResponse.json({
            success: false,
            error: `${service} service test hələ dəstəklənmir`
        });

    } catch (error) {
        console.error('API test error:', error);
        return NextResponse.json({
            success: false,
            error: 'Server xətası'
        }, {status: 500});
    }
}
