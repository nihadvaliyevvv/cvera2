# AI Professional Summary Feature Documentation

## 🤖 AI Professional Summary Funksiyası

### Ümumi Baxış
LinkedIn məlumatlarından və CV data-sından istifadə edərək Gemini AI ilə professional summary avtomatik olaraq yaradır.

### Premium Funksiya
- **Medium** və **Premium** istifadəçilər üçün mövcuddur
- **Free** istifadəçilər yalnız manual summary yaza bilərlər
- AI funksiyası üçün upgrade message göstərilir

## 🔧 Texniki Detallar

### API Endpoints

#### `/api/ai/summary` - POST
AI powered professional summary yaradır.

**Request:**
```json
{
  "cvData": {
    "personalInfo": {
      "fullName": "Nihat Valiyev",
      "email": "nihat@example.com",
      "phone": "+994 50 123 45 67",
      "linkedin": "https://linkedin.com/in/nihatvaliyev"
    },
    "experience": [...],
    "education": [...],
    "skills": [...],
    "projects": [...]
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "summary": "Nihat Valiyev - Senior Software Developer sahəsində təcrübəli mütəxəssis. React, TypeScript və Node.js texnologiyaları ilə 5+ il təcrübəsi var. Azerbaijan Technical University-də Computer Science sahəsində təhsil alıb. E-commerce platforması kimi kompleks layihələrdə işləyib və modern web texnologiyaları ilə peşəkar həllər yaradıb.",
  "message": "Professional summary AI ilə yaradıldı!",
  "user": {
    "tier": "Premium",
    "canUseAI": true
  }
}
```

**Response (Access Denied):**
```json
{
  "error": "AI features are only available for Premium and Medium users",
  "message": "AI professional summary Premium və Medium istifadəçilər üçün mövcuddur. Planınızı yüksəldin!",
  "tier": "Free",
  "upgradeRequired": true
}
```

#### `/api/ai/summary` - GET
İstifadəçinin AI funksiyalarına access-ini yoxlayır.

**Response:**
```json
{
  "canUseAI": true,
  "tier": "Premium",
  "message": "AI professional summary mövcuddur!"
}
```

### Frontend Integration

#### PersonalInfoSection Component
```tsx
import PersonalInfoSection from './sections/PersonalInfoSection';

<PersonalInfoSection
  data={personalData}
  onChange={handlePersonalInfoChange}
  userTier={userTier} // 'Free', 'Medium', 'Premium'
  cvData={fullCVData} // Complete CV data for AI
/>
```

#### AI Button
- **Premium/Medium users:** Active AI button with loading state
- **Free users:** Disabled button with upgrade message
- **Features:**
  - Loading spinner during generation
  - Success notification
  - Error handling
  - Tier-based access control

## 🎯 İstifadəçi Təcrübəsi

### Premium/Medium Users
1. ✅ AI button aktiv və görünür
2. ✅ Button click → API call → AI summary generation
3. ✅ Generated summary textarea-ya avtomatik yazılır
4. ✅ Success notification göstərilir

### Free Users
1. 🔒 AI button görünür amma disabled
2. 🔒 Tooltip göstərir: "AI funksiyalar Premium üçün mövcuddur"
3. 🔒 Premium upgrade message box göstərilir
4. 🔒 Manual summary yazma mümkündür

## 🛠️ Quraşdırma

### Environment Variables
```bash
GEMINI_API_KEY=your-gemini-api-key-here
```

### Dependencies
```bash
npm install @google/generative-ai
```

### AI Logic Files
- `/src/lib/aiSummary.ts` - Core AI functions
- `/src/app/api/ai/summary/route.ts` - API endpoint
- `/src/components/cv/sections/PersonalInfoSection.tsx` - Frontend integration

## 🧪 Test

```bash
node test-ai-summary.js
```

Test edir:
1. Free user access control
2. Premium user AI generation
3. API response validation
4. Error handling

## 📊 AI Prompt Structure

### Input Data
```typescript
interface CVDataForSummary {
  personalInfo: PersonalInfo;
  experience?: Experience[];
  education?: Education[];
  skills?: Skill[];
  projects?: Project[];
}
```

### AI Prompt Template
```text
Aşağıdaki CV məlumatlarına əsasən professional və cəlbedici bir career summary yazın. 
Summary Azərbaycan dilində olmalıdır və maksimum 3-4 cümlə olmalıdır.

Şəxsi məlumatlar: [personalInfo]
İş təcrübəsi: [experience]
Təhsil: [education]
Bacarıqlar: [skills]
Layihələr: [projects]

Kriteriyalar:
1. Azərbaycan dilində
2. Maksimum 3-4 cümlə
3. Professional və cəlbedici
4. Əsas bacarıqları vurğulasın
5. İş axtarışında faydalı olsun
```

### Fallback Logic
AI uğursuz olarsa, static template-dən istifadə edilir:
```text
"[Ad] - [Son iş mövqeyi] sahəsində təcrübəli mütəxəssis. 
[İş sayı] müxtəlif şirkətdə təcrübə var. 
[Təhsil] təhsil alıb. 
[Top 3 skills] sahələrində bacarıqlıdır. 
Yeni imkanlar üçün hazırdır."
```

## 🔐 Security

### Authentication
- JWT token required
- User tier validation
- Access control based on subscription

### Rate Limiting
- API calls logged for analytics
- User-based usage tracking
- Premium tier verification

### Data Privacy
- CV data temporary processing only
- No permanent storage of personal data
- GDPR compliance ready

## 📈 Analytics

### Tracking Events
- AI summary generation count
- User tier usage stats
- Success/error rates
- Popular features tracking

### Metrics
```typescript
{
  totalAISummariesGenerated: number,
  premiumUsageCount: number,
  mediumUsageCount: number,
  averageGenerationTime: number,
  successRate: percentage
}
```

## 🚀 Future Enhancements

### V2 Features
- [ ] Multiple summary styles (Creative, Professional, Technical)
- [ ] Industry-specific summaries
- [ ] Multi-language support
- [ ] Tone customization
- [ ] Length options (Short, Medium, Long)

### Advanced AI
- [ ] GPT-4 integration alternative
- [ ] Custom fine-tuned models
- [ ] Azerbaijani language optimization
- [ ] Context-aware improvements

## 🐛 Troubleshooting

### Common Issues

**1. AI Generation Failed**
```javascript
// Check Gemini API key
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Set' : 'Missing');

// Verify user tier
const user = await prisma.user.findUnique({ where: { id: userId } });
console.log('User tier:', user.tier);
```

**2. Access Denied**
```javascript
// Verify JWT token
const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
if (!token) {
  // Redirect to login
}
```

**3. API Timeout**
```javascript
// Add timeout handling
const controller = new AbortController();
setTimeout(() => controller.abort(), 30000); // 30s timeout

fetch('/api/ai/summary', {
  signal: controller.signal,
  // ... other options
});
```

## 📞 Support

Problemlər və ya təkliflər üçün:
- GitHub Issues: Repository issues section
- Email: support@cvera.az
- Documentation: README.md

---

**Note:** Bu funksiya Premium monetization strategiyasının əsas hissəsidir. Free users üçün upgrade incentive yaradır və Premium users üçün real value təqdim edir.
