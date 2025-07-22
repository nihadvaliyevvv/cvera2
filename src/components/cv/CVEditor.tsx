'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { CVData as CVDataType } from '@/types/cv';
import { CVLanguage, getDefaultCVLanguage, getLabel, SECTION_LABELS } from '@/lib/cvLanguage';
import { translateCVContent, canUseAIFeatures } from '@/lib/aiSummary';
import PersonalInfoSection from './sections/PersonalInfoSection';
import ExperienceSection from './sections/ExperienceSection';
import EducationSection from './sections/EducationSection';
import SkillsSection from './sections/SkillsSection';
import LanguagesSection from './sections/LanguagesSection';
import ProjectsSection from './sections/ProjectsSection';
import CertificationsSection from './sections/CertificationsSection';
import VolunteerExperienceSection from './sections/VolunteerExperienceSection';
// import PublicationsSection from './sections/PublicationsSection';
// import HonorsAwardsSection from './sections/HonorsAwardsSection';
// import TestScoresSection from './sections/TestScoresSection';
// import RecommendationsSection from './sections/RecommendationsSection';
// import CoursesSection from './sections/CoursesSection';
import TemplateSelector from './TemplateSelector';
import CVPreviewA4 from './CVPreviewA4';
import styles from './CVEditor.module.css';

interface CVData {
  id?: string;
  title: string;
  templateId: string;
  data: CVDataType;
}

interface CVEditorProps {
  cvId?: string;
  onSave: (cv: CVData) => void;
  onCancel: () => void;
  initialData?: any;
  userTier?: string;
}

// Transform LinkedIn data to CV data format
  const transformLinkedInDataToCVData = (linkedInData: any): CVDataType => {
    console.log('🎯 CVEditor: Transforming LinkedIn data:', linkedInData);
    console.log('🎯 CVEditor: PersonalInfo available:', linkedInData.personalInfo);
    console.log('🎯 CVEditor: Skills available:', linkedInData.skills, 'Type:', typeof linkedInData.skills);
    console.log('🎯 CVEditor: Certifications available:', linkedInData.certifications, 'Length:', Array.isArray(linkedInData.certifications) ? linkedInData.certifications.length : 'N/A');
    console.log('🎯 CVEditor: VolunteerExperience available:', linkedInData.volunteerExperience, 'Length:', Array.isArray(linkedInData.volunteerExperience) ? linkedInData.volunteerExperience.length : 'N/A');
    console.log('🎯 CVEditor: HonorsAwards available:', linkedInData.honorsAwards, 'Length:', Array.isArray(linkedInData.honorsAwards) ? linkedInData.honorsAwards.length : 'N/A');
    
    const transformedData = {
      personalInfo: {
        fullName: linkedInData.personalInfo?.name || linkedInData.name || linkedInData.fullName || '',
        email: linkedInData.personalInfo?.email || linkedInData.email || '',
        phone: linkedInData.personalInfo?.phone || linkedInData.phone || '',
        address: linkedInData.personalInfo?.address || linkedInData.address || linkedInData.location || '',
        website: linkedInData.personalInfo?.website || linkedInData.website || linkedInData.public_profile_url || '',
        linkedin: linkedInData.personalInfo?.linkedin || linkedInData.linkedin || linkedInData.public_profile_url || '',
        summary: linkedInData.personalInfo?.summary || linkedInData.personalInfo?.headline || linkedInData.headline || linkedInData.summary || ''
      },
      experience: (linkedInData.experience || []).map((exp: any) => ({
        position: exp.title || exp.position || '',
        company: exp.company || exp.company_name || '',
        startDate: exp.start_date || exp.startDate || '',
        endDate: exp.end_date || exp.endDate || 'Present',
        description: exp.description || '',
        location: exp.location || ''
      })),
      education: (linkedInData.education || []).map((edu: any) => ({
        degree: edu.degree || edu.field_of_study || '',
        institution: edu.school || edu.institution || '',
        year: edu.end_date || edu.year || '',
        description: edu.description || '',
        gpa: edu.gpa || ''
      })),
      skills: linkedInData.skills ? 
        (Array.isArray(linkedInData.skills) ? 
          linkedInData.skills.map((skill: any) => ({
            name: typeof skill === 'string' ? skill : skill.name || '',
            level: 'Intermediate' as const
          })) : 
          (typeof linkedInData.skills === 'string' && linkedInData.skills.trim() ?
            linkedInData.skills.split('|').map((skill: string) => ({
              name: skill.trim(),
              level: 'Intermediate' as const
            })) : []
          )
        ) : [],
      languages: (linkedInData.languages || []).map((lang: any) => ({
        name: typeof lang === 'string' ? lang : lang.name || '',
        proficiency: typeof lang === 'string' ? 'Professional' : lang.proficiency || 'Professional'
      })),
      projects: (linkedInData.projects || []).map((proj: any) => ({
        name: proj.title || proj.name || '',
        description: proj.description || '',
        startDate: proj.start_date || proj.startDate || '',
        endDate: proj.end_date || proj.endDate || '',
        skills: proj.skills || '',
        url: proj.url || ''
      })),
      certifications: Array.isArray(linkedInData.certifications) ? 
        linkedInData.certifications.map((cert: any) => ({
          name: cert.name || cert.title || cert.certification || '',
          issuer: cert.authority || cert.issuer || cert.organization || '',
          date: cert.start_date || cert.date || cert.issued_date || '',
          description: cert.description || ''
        })) : [],
      volunteerExperience: Array.isArray(linkedInData.volunteerExperience) ? 
        linkedInData.volunteerExperience.map((vol: any) => ({
          organization: vol.organization || vol.company || '',
          role: vol.role || vol.title || vol.position || '',
          startDate: vol.start_date || vol.startDate || vol.date_range || '',
          endDate: vol.end_date || vol.endDate || '',
          description: vol.description || '',
          cause: vol.cause || vol.topic || ''
        })) : [],
      publications: (linkedInData.publications || []).map((pub: any) => ({
        title: pub.title || pub.name || '',
        publisher: pub.publisher || pub.publication || '',
        date: pub.date || pub.published_date || '',
        description: pub.description || '',
        url: pub.url || ''
      })),
      honorsAwards: Array.isArray(linkedInData.honorsAwards) ? 
        linkedInData.honorsAwards.map((award: any) => ({
          title: award.title || award.name || '',
          issuer: award.issuer || award.authority || '',
          date: award.date || award.issued_date || '',
          description: award.description || ''
        })) : [],
      testScores: (linkedInData.testScores || linkedInData.test_scores || []).map((test: any) => ({
        name: test.name || test.title || '',
        score: test.score || '',
        date: test.date || '',
        description: test.description || ''
      })),
      recommendations: (linkedInData.recommendations || []).map((rec: any) => ({
        recommender: rec.recommender || rec.name || '',
        relation: rec.relation || rec.relationship || '',
        text: rec.text || rec.recommendation || '',
        date: rec.date || ''
      })),
      courses: (linkedInData.courses || []).map((course: any) => ({
        name: course.name || course.title || '',
        institution: course.institution || course.provider || '',
        date: course.date || course.completion_date || '',
        description: course.description || ''
      }))
    };
    
    console.log('Transformed data:', transformedData);
    return transformedData;
  };

export default function CVEditor({ cvId, onSave, onCancel, initialData, userTier = 'Free' }: CVEditorProps) {
  const [cv, setCv] = useState<CVData>(() => {
    if (initialData) {
      const transformedData = transformLinkedInDataToCVData(initialData);
      return {
        title: 'Imported CV',
        templateId: 'professional',
        data: {
          ...transformedData,
          cvLanguage: getDefaultCVLanguage()
        }
      };
    }
    return {
      title: '',
      templateId: '',
      data: {
        personalInfo: {
          fullName: '',
          email: '',
          phone: '',
          address: '',
          website: '',
          linkedin: '',
          summary: ''
        },
        experience: [],
        education: [],
        skills: [],
        languages: [],
        projects: [],
        certifications: [],
        volunteerExperience: [],
        publications: [],
        honorsAwards: [],
        testScores: [],
        recommendations: [],
        courses: [],
        cvLanguage: getDefaultCVLanguage()
      }
    };
  });

  const [activeSection, setActiveSection] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState<'pdf' | 'docx' | null>(null);
  const [translating, setTranslating] = useState(false);
  const [showTranslationDialog, setShowTranslationDialog] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState<CVLanguage | null>(null);

  // Handle CV language change with translation option
  const handleLanguageChange = async (newLanguage: CVLanguage) => {
    const currentLanguage = cv.data.cvLanguage || 'azerbaijani';
    
    // If language is the same, no need to change
    if (currentLanguage === newLanguage) return;

    // Check if user has content to translate
    const hasContent = cv.data.personalInfo?.summary || 
                      (cv.data.experience && cv.data.experience.length > 0) ||
                      (cv.data.education && cv.data.education.length > 0);

    // If user has AI features and content, show translation dialog
    if (canUseAIFeatures(userTier) && hasContent) {
      setPendingLanguage(newLanguage);
      setShowTranslationDialog(true);
    } else {
      // Just change language without translation
      setCv(prevCv => ({
        ...prevCv,
        data: {
          ...prevCv.data,
          cvLanguage: newLanguage
        }
      }));
    }
  };

  // Translate CV content to new language
  const handleTranslateContent = async () => {
    if (!pendingLanguage) return;

    setTranslating(true);
    setShowTranslationDialog(false);
    
    try {
      const translatedData = await translateCVContent(cv.data, pendingLanguage);
      setCv(prevCv => ({
        ...prevCv,
        data: translatedData
      }));
      setSuccess(pendingLanguage === 'english' ? 
        'CV content translated to English successfully!' : 
        'CV məzmunu Azərbaycan dilinə tərcümə edildi!'
      );
    } catch (error) {
      console.error('Translation error:', error);
      setError('Translation failed. Language changed without content translation.');
      // Still change the language even if translation fails
      setCv(prevCv => ({
        ...prevCv,
        data: {
          ...prevCv.data,
          cvLanguage: pendingLanguage
        }
      }));
    } finally {
      setTranslating(false);
      setPendingLanguage(null);
    }
  };

  // Skip translation and just change language
  const handleSkipTranslation = () => {
    if (!pendingLanguage) return;
    
    setCv(prevCv => ({
      ...prevCv,
      data: {
        ...prevCv.data,
        cvLanguage: pendingLanguage
      }
    }));
    
    setShowTranslationDialog(false);
    setPendingLanguage(null);
  };

  const loadCV = useCallback(async () => {
    if (!cvId) return;
    
    setLoading(true);
    setError('');
    
    try {
      const result = await apiClient.getCV(cvId);
      
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid CV data structure');
      }
      
      if (!result.cv_data || typeof result.cv_data !== 'object') {
        throw new Error('CV data is missing or corrupted');
      }
      
      const templateId = result.cv_data.templateId || result.templateId || '';
      
      const transformedCV = {
        id: result.id,
        title: result.title || '',
        templateId: templateId,
        data: {
          personalInfo: result.cv_data.personalInfo || {
            fullName: '',
            email: '',
            phone: '',
            website: '',
            linkedin: '',
            summary: ''
          },
          experience: Array.isArray(result.cv_data.experience) ? result.cv_data.experience : [],
          education: Array.isArray(result.cv_data.education) ? result.cv_data.education : [],
          skills: Array.isArray(result.cv_data.skills) ? result.cv_data.skills : [],
          languages: Array.isArray(result.cv_data.languages) ? result.cv_data.languages : [],
          projects: Array.isArray(result.cv_data.projects) ? result.cv_data.projects : [],
          certifications: Array.isArray(result.cv_data.certifications) ? result.cv_data.certifications : [],
          volunteerExperience: Array.isArray(result.cv_data.volunteerExperience) ? result.cv_data.volunteerExperience : [],
          publications: Array.isArray(result.cv_data.publications) ? result.cv_data.publications : [],
          honorsAwards: Array.isArray(result.cv_data.honorsAwards) ? result.cv_data.honorsAwards : [],
          testScores: Array.isArray(result.cv_data.testScores) ? result.cv_data.testScores : [],
          recommendations: Array.isArray(result.cv_data.recommendations) ? result.cv_data.recommendations : [],
          courses: Array.isArray(result.cv_data.courses) ? result.cv_data.courses : []
        }
      };
      
      setCv(transformedCV);
    } catch (err) {
      console.error('CV loading error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`CV yüklənərkən xəta baş verdi: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [cvId]);

  useEffect(() => {
    console.log('CVEditor useEffect:', { cvId, hasInitialData: !!initialData, initialData });
    if (cvId) {
      loadCV();
    } else if (initialData) {
      console.log('CVEditor: Transforming LinkedIn data to CV data');
      const transformedData = transformLinkedInDataToCVData(initialData);
      console.log('CVEditor: Transformed data:', transformedData);
      setCv({
        title: 'Imported CV',
        templateId: 'professional',
        data: transformedData
      });
    }
  }, [cvId, loadCV, initialData]);

  const handleSave = async () => {
    // Basic validation
    const validationErrors = [];
    
    if (!cv.title || cv.title.trim().length === 0) {
      validationErrors.push('CV başlığı tələb olunur');
    }

    if (!cv.templateId || cv.templateId.trim().length === 0) {
      validationErrors.push('Şablon seçimi tələb olunur');
    }

    if (!cv.data.personalInfo || !cv.data.personalInfo.fullName || cv.data.personalInfo.fullName.trim().length === 0) {
      validationErrors.push('Ad tələb olunur');
    }
    
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const sanitizedData = {
        personalInfo: cv.data.personalInfo,
        experience: Array.isArray(cv.data.experience) ? cv.data.experience : [],
        education: Array.isArray(cv.data.education) ? cv.data.education : [],
        skills: Array.isArray(cv.data.skills) ? cv.data.skills : [],
        languages: Array.isArray(cv.data.languages) ? cv.data.languages : [],
        projects: Array.isArray(cv.data.projects) ? cv.data.projects : [],
        certifications: Array.isArray(cv.data.certifications) ? cv.data.certifications : [],
        volunteerExperience: Array.isArray(cv.data.volunteerExperience) ? cv.data.volunteerExperience : [],
        publications: Array.isArray(cv.data.publications) ? cv.data.publications : [],
        honorsAwards: Array.isArray(cv.data.honorsAwards) ? cv.data.honorsAwards : [],
        testScores: Array.isArray(cv.data.testScores) ? cv.data.testScores : [],
        recommendations: Array.isArray(cv.data.recommendations) ? cv.data.recommendations : [],
        courses: Array.isArray(cv.data.courses) ? cv.data.courses : [],
        templateId: cv.templateId
      };

      const apiData = {
        title: cv.title,
        cv_data: sanitizedData
      };

      let result;
      if (cvId) {
        result = await apiClient.updateCV(cvId, apiData);
        setSuccess('CV uğurla yeniləndi!');
      } else {
        result = await apiClient.createCV(apiData);
        setSuccess('CV uğurla yaradıldı!');
      }
      
      setTimeout(() => {
        const cvForSave = {
          id: result.id,
          title: result.title,
          templateId: result.templateId,
          data: result.cv_data
        };
        onSave(cvForSave);
      }, 1500);
    } catch (err) {
      console.error('CV save error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`CV saxlanarkən xəta baş verdi: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const updateCVData = (section: keyof CVData['data'], data: CVData['data'][typeof section]) => {
    setCv(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [section]: data
      }
    }));
  };

  const handleExport = async (format: 'pdf' | 'docx') => {
    if (!cv.id) {
      setError('CV-ni ilk öncə saxlamalısınız');
      return;
    }

    setExporting(format);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/cvs/${cv.id}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ format }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Export failed: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cv.title || 'CV'}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setSuccess(`${format.toUpperCase()} faylı uğurla yükləndi`);
    } catch (err) {
      console.error(`${format.toUpperCase()} export error:`, err);
      const errorMessage = err instanceof Error ? err.message : 'Naməlum xəta baş verdi';
      setError(`${format.toUpperCase()} export xətası: ${errorMessage}`);
    } finally {
      setExporting(null);
    }
  };

  // Get sections based on CV language
  const getSections = (language: CVLanguage) => {
    if (language === 'english') {
      return [
        { id: 'personal', label: 'Personal Information', icon: '👤' },
        { id: 'experience', label: 'Work Experience', icon: '💼' },
        { id: 'education', label: 'Education', icon: '🎓' },
        { id: 'skills', label: 'Skills', icon: '🛠️' },
        { id: 'languages', label: 'Languages', icon: '🌍' },
        { id: 'projects', label: 'Projects', icon: '🚀' },
        { id: 'certifications', label: 'Certifications', icon: '🏆' },
        { id: 'volunteer', label: 'Volunteer Experience', icon: '❤️' },
        { id: 'template', label: 'Template Selection', icon: '🎨' }
      ];
    } else {
      return [
        { id: 'personal', label: 'Şəxsi Məlumatlar', icon: '👤' },
        { id: 'experience', label: 'İş Təcrübəsi', icon: '💼' },
        { id: 'education', label: 'Təhsil', icon: '🎓' },
        { id: 'skills', label: 'Bacarıqlar', icon: '🛠️' },
        { id: 'languages', label: 'Dillər', icon: '🌍' },
        { id: 'projects', label: 'Layihələr', icon: '🚀' },
        { id: 'certifications', label: 'Sertifikatlar', icon: '🏆' },
        { id: 'volunteer', label: 'Könüllü Təcrübə', icon: '❤️' },
        { id: 'template', label: 'Şablon Seçimi', icon: '🎨' }
      ];
    }
  };

  const sections = getSections(cv.data.cvLanguage || 'azerbaijani');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">CV yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="sticky top-0 z-[60] bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onCancel}
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Geri</span>
              </button>
              <input
                type="text"
                placeholder="CV başlığı..."
                value={cv.title}
                onChange={(e) => setCv(prev => ({ ...prev, title: e.target.value }))}
                className="w-full sm:w-64 text-lg font-semibold border-none outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-3 py-2 bg-gray-50 hover:bg-gray-100 focus:bg-white transition-colors"
              />
              
              {/* CV Language Selector */}
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <select
                  value={cv.data.cvLanguage || 'azerbaijani'}
                  onChange={(e) => handleLanguageChange(e.target.value as CVLanguage)}
                  disabled={translating}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                >
                  <option value="azerbaijani">🇦🇿 Azərbaycan</option>
                  <option value="english">🇺🇸 English</option>
                </select>
                {translating && (
                  <div className="flex items-center text-sm text-blue-600">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Translating...
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleExport('pdf')}
                disabled={!cv.id || exporting !== null}
                className={`hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  !cv.id || exporting !== null
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {exporting === 'pdf' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 2v4h8V2h2a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h2z"/>
                  </svg>
                )}
                PDF
              </button>
              
              <button
                onClick={() => handleExport('docx')}
                disabled={!cv.id || exporting !== null}
                className={`hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  !cv.id || exporting !== null
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {exporting === 'docx' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                  </svg>
                )}
                DOCX
              </button>
              
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="hidden sm:inline">Saxlanır...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="hidden sm:inline">Saxla</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col xl:flex-row gap-5">
          {/* Left Panel - Form */}
          <div className="flex-1 xl:max-w-xl">
            {/* Mobile Section Selector */}
            <div className="xl:hidden mb-5 relative z-40">
              <select
                value={activeSection}
                onChange={(e) => setActiveSection(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 relative z-40"
              >
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.icon} {section.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Desktop Section Navigation */}
            <div className="hidden xl:block mb-5">
              <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5">
                <div className="grid grid-cols-2 gap-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-all text-xs ${
                        activeSection === section.id
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span>{section.icon}</span>
                      <span className="font-medium">{section.label}</span>
                    </button>
                  ))}
                </div>
              </nav>
            </div>

            {/* Form Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-5">
                {/* Messages */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span className="text-sm">{error}</span>
                    </div>
                  </div>
                )}
                
                {success && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm">{success}</span>
                    </div>
                  </div>
                )}

                {/* LinkedIn Import Info */}
                {initialData && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      <span className="font-medium text-green-800 text-sm">LinkedIn məlumatları import edildi</span>
                    </div>
                    <p className="text-xs text-green-700">
                      Məlumatlar uğurla yükləndi və CV-yə əlavə edildi.
                    </p>
                  </div>
                )}
                
                {/* Dynamic Section Content */}
                <div className="space-y-4">
                  {activeSection === 'personal' && (
                    <PersonalInfoSection
                      data={{
                        name: cv.data.personalInfo.fullName,
                        email: cv.data.personalInfo.email,
                        phone: cv.data.personalInfo.phone,
                        website: cv.data.personalInfo.website,
                        linkedin: cv.data.personalInfo.linkedin,
                        summary: cv.data.personalInfo.summary,
                        profileImage: cv.data.personalInfo.profileImage
                      }}
                      userTier={userTier}
                      cvData={cv.data}
                      language={cv.data.cvLanguage || 'azerbaijani'}
                      onChange={(data: any) => updateCVData('personalInfo', {
                        fullName: data.name,
                        email: data.email,
                        phone: data.phone,
                        website: data.website,
                        linkedin: data.linkedin,
                        summary: data.summary,
                        profileImage: data.profileImage
                      })}
                    />
                  )}
                  {activeSection === 'experience' && (
                    <ExperienceSection
                      data={cv.data.experience || [] as any}
                      language={cv.data.cvLanguage || 'azerbaijani'}
                      onChange={(data: CVData['data']['experience']) => updateCVData('experience', data)}
                    />
                  )}
                  {activeSection === 'education' && (
                    <EducationSection
                      data={cv.data.education || [] as any}
                      language={cv.data.cvLanguage || 'azerbaijani'}
                      onChange={(data: CVData['data']['education']) => updateCVData('education', data)}
                    />
                  )}
                  {activeSection === 'skills' && (
                    <SkillsSection
                      data={cv.data.skills || [] as any}
                      language={cv.data.cvLanguage || 'azerbaijani'}
                      onChange={(data: any) => updateCVData('skills', data)}
                    />
                  )}
                  {activeSection === 'languages' && (
                    <LanguagesSection
                      data={cv.data.languages || [] as any}
                      language={cv.data.cvLanguage || 'azerbaijani'}
                      onChange={(data: any) => updateCVData('languages', data)}
                    />
                  )}
                  {activeSection === 'projects' && (
                    <ProjectsSection
                      data={cv.data.projects || [] as any}
                      language={cv.data.cvLanguage || 'azerbaijani'}
                      onChange={(data: any) => updateCVData('projects', data)}
                    />
                  )}
                  {activeSection === 'certifications' && (
                    <CertificationsSection
                      data={cv.data.certifications || [] as any}
                      language={cv.data.cvLanguage || 'azerbaijani'}
                      onChange={(data: any) => updateCVData('certifications', data)}
                    />
                  )}
                  {activeSection === 'volunteer' && (
                    <VolunteerExperienceSection
                      data={cv.data.volunteerExperience || [] as any}
                      language={cv.data.cvLanguage || 'azerbaijani'}
                      onChange={(data: any) => updateCVData('volunteerExperience', data)}
                    />
                  )}
                  {/* {activeSection === 'publications' && (
                    <PublicationsSection
                      data={cv.data.publications || []}
                      onChange={(data: any) => updateCVData('publications', data)}
                    />
                  )}
                  {activeSection === 'honors' && (
                    <HonorsAwardsSection
                      data={cv.data.honorsAwards || []}
                      onChange={(data: any) => updateCVData('honorsAwards', data)}
                    />
                  )}
                  {activeSection === 'testScores' && (
                    <TestScoresSection
                      data={cv.data.testScores || []}
                      onChange={(data: any) => updateCVData('testScores', data)}
                    />
                  )}
                  {activeSection === 'recommendations' && (
                    <RecommendationsSection
                      data={cv.data.recommendations || []}
                      onChange={(data: any) => updateCVData('recommendations', data)}
                    />
                  )}
                  {activeSection === 'courses' && (
                    <CoursesSection
                      data={cv.data.courses || []}
                      onChange={(data: any) => updateCVData('courses', data)}
                    />
                  )} */}
                  {activeSection === 'template' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">Şablon Seçimi</h3>
                      <TemplateSelector
                        selectedTemplateId={cv.templateId}
                        onTemplateSelect={(templateId: string) => setCv(prev => ({ ...prev, templateId }))}
                        userTier={userTier}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Export Buttons */}
            <div className="sm:hidden mt-5 bg-white rounded-lg shadow-sm border border-gray-200 p-3.5">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={!cv.id || exporting !== null}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    !cv.id || exporting !== null
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {exporting === 'pdf' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 2v4h8V2h2a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h2z"/>
                    </svg>
                  )}
                  PDF
                </button>
                
                <button
                  onClick={() => handleExport('docx')}
                  disabled={!cv.id || exporting !== null}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    !cv.id || exporting !== null
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {exporting === 'docx' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                    </svg>
                  )}
                  DOCX
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 xl:max-w-5xl">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-5 py-3.5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-gray-800">Canlı Önizləmə</h3>
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">
                      A4 Format
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="hidden sm:inline text-xs">Canlı güncəllənir</span>
                  </div>
                </div>
              </div>
                
                <div className="bg-gray-50" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minHeight: '95vh',
                  width: '100%',
                  padding: '25px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%'
                  }}>
                    {cv.templateId ? (
                      <div className="shadow-lg bg-white rounded-lg overflow-hidden" style={{ 
                        width: '794px', // Exact A4 width at 96 DPI
                        height: '95vh',
                        minHeight: '900px',
                        maxHeight: '1600px',
                        border: '1px solid #e5e7eb',
                        aspectRatio: '794/1123', // Real A4 aspect ratio
                        margin: '0 auto'
                      }}>
                        <div className={`w-full h-full ${styles.responsivePreview}`} style={{
                          scrollbarWidth: 'thin',
                          scrollbarColor: '#cbd5e1 #f1f5f9',
                          minHeight: '100%',
                          boxSizing: 'border-box'
                        }}>
                          <CVPreviewA4 cv={{
                            ...cv,
                            data: {
                              ...cv.data,
                              personalInfo: {
                                ...cv.data.personalInfo,
                                name: cv.data.personalInfo.fullName
                              }
                            } as any
                          }} />
                        </div>
                      </div>
                    ) : (
                      <div className="shadow-lg bg-white rounded-lg flex items-center justify-center text-center" style={{ 
                        width: '794px', // Match A4 width
                        height: '95vh', // Match the preview height
                        minHeight: '900px',
                        maxHeight: '1600px',
                        border: '1px solid #e5e7eb',
                        margin: '0 auto'
                      }}>
                        <div>
                          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                            <path d="M14 2v6h6"/>
                          </svg>
                          <h3 className="text-lg font-medium mb-2 text-gray-600">Şablon Seçin</h3>
                          <p className="text-sm text-gray-500 mb-4">CV önizləməsini görmək üçün bir şablon seçin</p>
                          <button
                            onClick={() => setActiveSection('template')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Şablon Seç
                          </button>
                        </div>
                      </div>
                    )}
                  </div>              </div>
              
              {/* Export disclaimer */}
              {cv.id && (
                <div className="px-5 py-2.5 bg-yellow-50 border-t border-yellow-200">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-600 flex-shrink-0">💡</span>
                    <div className="text-xs text-yellow-800">
                      <strong>Qeyd:</strong> Önizləmə tam hazır olmaya bilər, ancaq export edilən faylda bütün məlumatlarınız düzgün görünəcək.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Translation Dialog */}
      {showTranslationDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">
                {pendingLanguage === 'english' ? 'Translate to English?' : 'Azərbaycan dilinə tərcümə edilsin?'}
              </h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              {pendingLanguage === 'english' ? 
                'Would you like to translate your CV content to English using AI? This will translate your experience, education, and other text content.' :
                'CV məzmununuzu AI ilə Azərbaycan dilinə tərcümə etmək istəyirsiniz? Bu, təcrübə, təhsil və digər mətn məzmununu tərcümə edəcək.'
              }
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleSkipTranslation}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {pendingLanguage === 'english' ? 'Skip Translation' : 'Tərcüməni Keç'}
              </button>
              <button
                onClick={handleTranslateContent}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {pendingLanguage === 'english' ? 'Translate Content' : 'Məzmunu Tərcümə Et'}
              </button>
            </div>
            
            {!canUseAIFeatures(userTier) && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  {pendingLanguage === 'english' ? 
                    'AI translation requires Premium subscription. Only the interface language will change.' :
                    'AI tərcümə Premium abunəlik tələb edir. Yalnız interfeys dili dəyişəcək.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
