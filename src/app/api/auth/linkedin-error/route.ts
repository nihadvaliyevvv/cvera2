import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const error = searchParams.get('error');
    const details = searchParams.get('details');
    const debug = searchParams.get('debug');

    // Map LinkedIn OAuth errors to user-friendly messages
    const errorMessages: Record<string, { title: string; message: string; suggestion: string }> = {
      'linkedin_oauth_failed': {
        title: 'LinkedIn Login Failed',
        message: 'There was an issue connecting to your LinkedIn account. Please try again.',
        suggestion: 'Make sure you allow access to your LinkedIn profile when prompted.'
      },
      'no_code_received': {
        title: 'Authorization Issue',
        message: 'We didn\'t receive authorization from LinkedIn.',
        suggestion: 'Please try the LinkedIn login process again.'
      },
      'token_exchange_failed': {
        title: 'Authentication Error',
        message: 'Failed to complete LinkedIn authentication.',
        suggestion: 'This might be a temporary issue. Please try again in a few moments.'
      },
      'profile_fetch_failed': {
        title: 'Profile Access Error',
        message: 'We couldn\'t access your LinkedIn profile information.',
        suggestion: 'Please ensure your LinkedIn profile is public or try again.'
      },
      'no_email_provided': {
        title: 'Email Required',
        message: 'We need access to your email address to create your account.',
        suggestion: 'Please make sure your LinkedIn email is accessible and try again.'
      },
      'authentication_failed': {
        title: 'Login Failed',
        message: 'An unexpected error occurred during login.',
        suggestion: 'Please try again or contact support if the issue persists.'
      }
    };

    const errorInfo = (error && errorMessages[error]) || {
      title: 'Login Issue',
      message: 'An unknown error occurred during LinkedIn login.',
      suggestion: 'Please try again or use email login instead.'
    };

    // Log the error for debugging
    console.error('LinkedIn login error page accessed:', {
      error,
      details,
      debug,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    });

    // Return HTML error page instead of JSON for better UX
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${errorInfo.title} - CVera</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 20px; background: #f5f5f5; }
        .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center; }
        .error-icon { font-size: 48px; margin-bottom: 20px; }
        h1 { color: #d32f2f; margin-bottom: 16px; font-size: 24px; }
        p { color: #666; line-height: 1.6; margin-bottom: 24px; }
        .suggestion { background: #f0f7ff; padding: 16px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #2196f3; }
        .buttons { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .btn { padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; transition: all 0.2s; }
        .btn-primary { background: #0066cc; color: white; }
        .btn-primary:hover { background: #0052a3; }
        .btn-secondary { background: #f5f5f5; color: #333; }
        .btn-secondary:hover { background: #e0e0e0; }
        .details { margin-top: 24px; padding-top: 24px; border-top: 1px solid #eee; font-size: 14px; color: #999; }
    </style>
</head>
<body>
    <div class="container">
        <div class="error-icon">⚠️</div>
        <h1>${errorInfo.title}</h1>
        <p>${errorInfo.message}</p>
        <div class="suggestion">
            <strong>💡 Suggestion:</strong> ${errorInfo.suggestion}
        </div>
        <div class="buttons">
            <a href="/api/auth/linkedin" class="btn btn-primary">Try LinkedIn Again</a>
            <a href="/auth/login" class="btn btn-secondary">Use Email Login</a>
        </div>
        ${debug ? `<div class="details">Error Details: ${debug}</div>` : ''}
    </div>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (err) {
    console.error('Error page generation failed:', err);
    return NextResponse.redirect('https://cvera.net/auth/login?fallback=true');
  }
}
