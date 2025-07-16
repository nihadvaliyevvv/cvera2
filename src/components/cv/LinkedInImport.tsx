'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';

interface LinkedInData {
  sessionId?: string;
  redirectUrl?: string;
  personalInfo?: {
    name: string;
    email: string;
    phone?: string;
    linkedin: string;
    summary?: string;
    website?: string;
    headline?: string;
  };
  experience?: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string;
    jobType?: string;
    skills?: string;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description?: string;
    activities?: string;
    grade?: string;
  }>;
  skills?: Array<{
    name: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  }>;
  languages?: Array<{
    name: string;
    proficiency: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
    url?: string;
    licenseNumber?: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    url?: string;
    date?: string;
  }>;
  volunteerExperience?: Array<{
    organization: string;
    role: string;
    description: string;
    startDate: string;
    endDate?: string;
    date?: string;
    cause?: string;
  }>;
  honorsAwards?: Array<{
    title: string;
    issuer: string;
    date: string;
    description?: string;
  }>;
}

interface LinkedInImportProps {
  onImport: (data: LinkedInData) => void;
  onCancel: () => void;
}

export default function LinkedInImport({ onImport, onCancel }: LinkedInImportProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [importedData, setImportedData] = useState<LinkedInData | null>(null);

  const handleImport = async () => {
    if (!url.trim()) {
      setError('LinkedIn profil URL-ini daxil edin.');
      return;
    }

    if (!url.includes('linkedin.com/in/')) {
      setError('Yalnız LinkedIn profil URL-ləri dəstəklənir. Məsələn: https://linkedin.com/in/username');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Starting LinkedIn import for URL:', url);
      const apiResult = await apiClient.importLinkedIn(url);
      console.log('LinkedIn import API result:', apiResult);
      
      // Check if the API returns a sessionId and redirectUrl (new approach)
      if (apiResult && apiResult.sessionId && apiResult.redirectUrl) {
        console.log('Using session-based import with sessionId:', apiResult.sessionId);
        // Directly navigate to the session URL
        window.location.href = apiResult.redirectUrl;
        return;
      }
      
      // Fallback to old approach if no sessionId
      const transformedData = transformApiResponse(apiResult);
      console.log('Transformed LinkedIn data:', transformedData);
      
      setImportedData(transformedData);
    } catch (err) {
      console.error('LinkedIn import error:', err);
      
      // Extract error message from the API response
      let errorMessage = 'LinkedIn profili yüklənərkən xəta baş verdi.';
      
      if (err instanceof Error) {
        console.error('Error details:', {
          message: err.message,
          stack: err.stack,
          name: err.name
        });
        
        if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Şəbəkə bağlantısı problemi. Zəhmət olmasa internetə qoşulduğunuzdan əmin olun və yenidən cəhd edin.';
        } else if (err.message.includes('429') || err.message.includes('Rate limit')) {
          errorMessage = 'API sorğu limiti aşılıb. Zəhmət olmasa bir neçə dəqiqə gözləyin və yenidən cəhd edin.';
        } else if (err.message.includes('401') || err.message.includes('403') || err.message.includes('Permission')) {
          errorMessage = 'LinkedIn profili yüklənərkən icazə problemi yaşandı. Bu profil ictimai olmaya bilər və ya API xidməti müvəqqəti olaraq əlçatmazdır.';
        } else if (err.message.includes('404') || err.message.includes('Not found')) {
          errorMessage = 'LinkedIn profili tapılmadı. URL-nin düzgün olduğunu və profilin mövcud olduğunu yoxlayın.';
        } else if (err.message.includes('503')) {
          errorMessage = 'LinkedIn import xidməti müvəqqəti olaraq əlçatmazdır. Yüksək tələbat səbəbi ilə xidmət məhdudlaşdırılıb.';
        } else if (err.message.includes('Invalid URL')) {
          errorMessage = 'URL düzgün deyil. Zəhmət olmasa LinkedIn profil URL-i daxil edin.';
        } else {
          errorMessage = `Xəta: ${err.message}`;
        }
      }
      
      setError(errorMessage + '\n\nZəhmət olmasa:\n• URL-nin düzgün olduğundan əmin olun (https://linkedin.com/in/username formatında)\n• Profilin ictimai (public) olduğundan əmin olun\n• Bir az sonra yenidən cəhd edin');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (importedData) {
      onImport(importedData);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('az-AZ', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  // API cavabını frontend formatına çevir
  const transformApiResponse = (apiData: any): LinkedInData => {
    return {
      personalInfo: {
        name: apiData.personal_info?.full_name || '',
        email: apiData.personal_info?.email || '',
        phone: apiData.personal_info?.phone || '',
        linkedin: apiData.personal_info?.linkedin_url || url,
        summary: apiData.summary || '',
        website: apiData.personal_info?.website || '',
        headline: apiData.personal_info?.headline || ''
      },
      experience: (apiData.experience || []).map((exp: any) => ({
        company: exp.company || '',
        position: exp.title || '',
        startDate: exp.start_date || '',
        endDate: exp.end_date || '',
        current: exp.is_current || !exp.end_date,
        description: exp.description || '',
        jobType: exp.job_type || '',
        skills: exp.skills || ''
      })),
      education: (apiData.education || []).map((edu: any) => ({
        institution: edu.institution || '',
        degree: edu.degree || '',
        field: edu.field_of_study || edu.description || '',
        startDate: edu.start_date || '',
        endDate: edu.end_date || '',
        current: !edu.end_date,
        description: edu.description || '',
        activities: edu.activities || '',
        grade: edu.grade || ''
      })),
      skills: (apiData.skills || []).map((skill: any) => ({
        name: typeof skill === 'string' ? skill : skill.name || '',
        level: 'Intermediate' as const
      })),
      languages: (apiData.languages || []).map((lang: any) => ({
        name: lang.name || '',
        proficiency: lang.proficiency || ''
      })),
      certifications: (apiData.certifications || []).map((cert: any) => ({
        name: cert.name || '',
        issuer: cert.issuer || '',
        date: cert.date || '',
        url: cert.url || '',
        licenseNumber: cert.license_number || ''
      })),
      projects: (apiData.projects || []).map((project: any) => ({
        name: project.name || '',
        description: project.description || '',
        url: project.url || '',
        date: project.date || ''
      })),
      volunteerExperience: (apiData.volunteer_experience || []).map((vol: any) => ({
        organization: vol.organization || '',
        role: vol.role || '',
        description: vol.description || '',
        startDate: vol.start_date || '',
        endDate: vol.end_date || '',
        date: vol.date || '',
        cause: vol.cause || ''
      })),
      honorsAwards: (apiData.honors_awards || []).map((award: any) => ({
        title: award.title || '',
        issuer: award.issuer || '',
        date: award.date || '',
        description: award.description || ''
      }))
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-blue-600 text-white px-6 py-4">
          <h2 className="text-xl font-semibold">LinkedIn-dən Import Et</h2>
          <p className="text-blue-100 mt-1">
            LinkedIn profilinizi avtomatik olaraq CV-yə çevirin
          </p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {!importedData ? (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">💡 Necə işləyir?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• LinkedIn profil URL-nizi daxil edin</li>
                  <li>• Sistem avtomatik olaraq məlumatları çəkəcək</li>
                  <li>• İmport etmək istədiyiniz hissələri seçin</li>
                  <li>• Məlumatlar CV-yə əlavə olunacaq</li>
                </ul>

              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn Profil URL-i <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Nümunə: https://linkedin.com/in/john-doe
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                  {error}
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-900 mb-2">⚠️ Məlumat</h3>
                <p className="text-sm text-yellow-800">
                  Bu xidmət üçün LinkedIn profili ictimai (public) olmalıdır. 
                  Bəzi məlumatlar mövcud olmaya bilər və ya tam yüklənməyə bilər.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">✅ Import Uğurla Tamamlandı</h3>
                <p className="text-sm text-green-800">
                  LinkedIn profiliniz uğurla yükləndi. Aşağıdakı məlumatlar tapıldı:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">👤 Şəxsi məlumatlar</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Ad:</strong> {importedData.personalInfo?.name || 'N/A'}</div>
                    <div><strong>Email:</strong> {importedData.personalInfo?.email || 'N/A'}</div>
                    {importedData.personalInfo?.headline && (
                      <div><strong>Başlıq:</strong> {importedData.personalInfo.headline}</div>
                    )}
                    {importedData.personalInfo?.summary && (
                      <div><strong>Özet:</strong> {importedData.personalInfo.summary.substring(0, 100)}...</div>
                    )}
                  </div>
                </div>

                {/* Experience */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">💼 İş təcrübəsi</h4>
                  <div className="space-y-2 text-sm">
                    {importedData.experience?.slice(0, 3).map((exp, i) => (
                      <div key={i} className="border-l-2 border-blue-200 pl-2">
                        <div className="font-medium">{exp.position}</div>
                        <div className="text-gray-600">{exp.company}</div>
                        {exp.skills && (
                          <div className="text-xs text-gray-500 mt-1">Bacarıqlar: {exp.skills}</div>
                        )}
                      </div>
                    ))}
                    {importedData.experience && importedData.experience.length > 3 && (
                      <div className="text-gray-500">
                        ... və {importedData.experience.length - 3} daha çox
                      </div>
                    )}
                  </div>
                </div>

                {/* Education */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">🎓 Təhsil</h4>
                  <div className="space-y-2 text-sm">
                    {importedData.education?.slice(0, 2).map((edu, i) => (
                      <div key={i} className="border-l-2 border-green-200 pl-2">
                        <div className="font-medium">{edu.degree}</div>
                        <div className="text-gray-600">{edu.institution}</div>
                        {edu.field && (
                          <div className="text-xs text-gray-500">{edu.field}</div>
                        )}
                      </div>
                    ))}
                    {importedData.education && importedData.education.length > 2 && (
                      <div className="text-gray-500">
                        ... və {importedData.education.length - 2} daha çox
                      </div>
                    )}
                  </div>
                </div>

                {/* Skills */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">🛠️ Bacarıqlar</h4>
                  <div className="flex flex-wrap gap-1">
                    {importedData.skills?.slice(0, 8).map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {skill.name}
                      </span>
                    ))}
                    {importedData.skills && importedData.skills.length > 8 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{importedData.skills.length - 8} daha çox
                      </span>
                    )}
                  </div>
                </div>

                {/* Languages */}
                {importedData.languages && importedData.languages.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">🌍 Dillər</h4>
                    <div className="space-y-1 text-sm">
                      {importedData.languages.slice(0, 4).map((lang, i) => (
                        <div key={i} className="flex justify-between">
                          <span>{lang.name}</span>
                          <span className="text-gray-500">{lang.proficiency}</span>
                        </div>
                      ))}
                      {importedData.languages.length > 4 && (
                        <div className="text-gray-500">
                          +{importedData.languages.length - 4} daha çox
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">🏆 Sertifikatlar</h4>
                  <div className="space-y-2 text-sm">
                    {importedData.certifications && importedData.certifications.length > 0 ? (
                      <>
                        {importedData.certifications.slice(0, 3).map((cert, i) => (
                          <div key={i} className="border-l-2 border-yellow-200 pl-2">
                            <div className="font-medium">{cert.name}</div>
                            <div className="text-gray-600">{cert.issuer}</div>
                            {cert.date && (
                              <div className="text-xs text-gray-500">{cert.date}</div>
                            )}
                          </div>
                        ))}
                        {importedData.certifications.length > 3 && (
                          <div className="text-gray-500">
                            +{importedData.certifications.length - 3} daha çox
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-gray-500 text-center py-4">
                        Sertifikat məlumatı tapılmadı
                      </div>
                    )}
                  </div>
                </div>

                {/* Projects */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">🚀 Layihələr</h4>
                  <div className="space-y-2 text-sm">
                    {importedData.projects && importedData.projects.length > 0 ? (
                      <>
                        {importedData.projects.slice(0, 3).map((project, i) => (
                          <div key={i} className="border-l-2 border-purple-200 pl-2">
                            <div className="font-medium">{project.name}</div>
                            {project.description && (
                              <div className="text-gray-600 text-xs">{project.description.substring(0, 80)}...</div>
                            )}
                          </div>
                        ))}
                        {importedData.projects.length > 3 && (
                          <div className="text-gray-500">
                            +{importedData.projects.length - 3} daha çox
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-gray-500 text-center py-4">
                        Layihə məlumatı tapılmadı
                      </div>
                    )}
                  </div>
                </div>

                {/* Volunteer Experience */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">❤️ Könüllü təcrübə</h4>
                  <div className="space-y-2 text-sm">
                    {importedData.volunteerExperience && importedData.volunteerExperience.length > 0 ? (
                      <>
                        {importedData.volunteerExperience.slice(0, 2).map((vol, i) => (
                          <div key={i} className="border-l-2 border-red-200 pl-2">
                            <div className="font-medium">{vol.role}</div>
                            <div className="text-gray-600">{vol.organization}</div>
                            {vol.date && (
                              <div className="text-xs text-gray-500">{vol.date}</div>
                            )}
                            {vol.cause && (
                              <div className="text-xs text-gray-500">{vol.cause}</div>
                            )}
                          </div>
                        ))}
                        {importedData.volunteerExperience.length > 2 && (
                          <div className="text-gray-500">
                            +{importedData.volunteerExperience.length - 2} daha çox
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-gray-500 text-center py-4">
                        Könüllü təcrübə məlumatı tapılmadı
                      </div>
                    )}
                  </div>
                </div>

                {/* Honors & Awards */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">🏅 Mükafat və təqdirdirmələr</h4>
                  <div className="space-y-2 text-sm">
                    {importedData.honorsAwards && importedData.honorsAwards.length > 0 ? (
                      <>
                        {importedData.honorsAwards.slice(0, 3).map((award, i) => (
                          <div key={i} className="border-l-2 border-purple-200 pl-2">
                            <div className="font-medium">{award.title}</div>
                            <div className="text-gray-600">{award.issuer}</div>
                            {award.date && (
                              <div className="text-xs text-gray-500">{award.date}</div>
                            )}
                          </div>
                        ))}
                        {importedData.honorsAwards.length > 3 && (
                          <div className="text-gray-500">
                            +{importedData.honorsAwards.length - 3} daha çox
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-gray-500 text-center py-4">
                        Mükafat və təqdirdirmə məlumatı tapılmadı
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">ℹ️ Qeyd</h3>
                <p className="text-sm text-blue-800">
                  İmport edilən məlumatlar CV-yə əlavə olunacaq. Var olan məlumatlar əvəz olunmayacaq. 
                  Siz sonradan bütün məlumatları redaktə edə bilərsiniz.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Ləğv et
          </button>
          
          <div className="flex items-center gap-3">
            {!importedData ? (
              <button
                onClick={handleImport}
                disabled={loading || !url.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'API açarları yoxlanılır və məlumatlar yüklənir...' : 'İmport et'}
              </button>
            ) : (
              <button
                onClick={handleConfirmImport}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                CV-yə əlavə et
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}  
    