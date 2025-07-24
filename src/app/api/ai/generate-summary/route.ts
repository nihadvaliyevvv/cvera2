import { NextRequest, NextResponse } from 'next/server';
import { ScrapingDogLinkedInScraper } from '@/lib/scraper/scrapingdog-linkedin-scraper';

export async function POST(req: NextRequest) {
  try {
    const { profileData } = await req.json();

    if (!profileData) {
      return NextResponse.json({
        success: false,
        error: 'Profile data tapılmadı'
      }, { status: 400 });
    }

    console.log('🤖 AI Professional Summary generasiya edilir...');

    // Initialize scraper for AI features
    const scraper = new ScrapingDogLinkedInScraper();

    // Create profile text for AI analysis
    const profileText = `
Name: ${profileData.name || 'N/A'}
Headline: ${profileData.headline || 'N/A'}
About: ${profileData.about || 'N/A'}

Experience:
${profileData.experience?.map((exp: any, i: number) => 
  `${i + 1}. ${exp.position} at ${exp.company} (${exp.startDate} - ${exp.endDate || 'Present'})\n   ${exp.description || ''}`
).join('\n\n') || 'No experience data'}

Education:
${profileData.education?.map((edu: any, i: number) => 
  `${i + 1}. ${edu.degree || 'Degree'} in ${edu.field || 'Field'} at ${edu.institution} (${edu.startDate} - ${edu.endDate || 'Present'})`
).join('\n') || 'No education data'}

Skills:
${profileData.skills?.map((skill: any) => skill.name || skill).join(', ') || 'No skills data'}
    `.trim();

    console.log('📝 Profile text prepared for AI analysis');

    // Generate professional summary using public method
    const professionalSummary = await scraper.generateProfessionalSummaryPublic(profileText);

    console.log('✅ AI Professional Summary generated successfully');
    console.log(`📊 Summary length: ${professionalSummary.length} characters`);

    return NextResponse.json({
      success: true,
      summary: professionalSummary,
      message: 'AI Professional Summary uğurla generasiya edildi'
    });

  } catch (error: any) {
    console.error('❌ AI Summary generasiya xətası:', error);
    
    return NextResponse.json({
      success: false,
      error: 'AI Summary generasiya xətası: ' + (error.message || 'Bilinməyən xəta')
    }, { status: 500 });
  }
}
