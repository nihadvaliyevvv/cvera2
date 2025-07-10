'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { CVData as CVDataType } from '@/types/cv';
import PersonalInfoSection from './sections/PersonalInfoSection';
import ExperienceSection from './sections/ExperienceSection';
import EducationSection from './sections/EducationSection';
import SkillsSection from './sections/SkillsSection';
import LanguagesSection from './sections/LanguagesSection';
import ProjectsSection from './sections/ProjectsSection';
import CertificationsSection from './sections/CertificationsSection';
import VolunteerExperienceSection from './sections/VolunteerExperienceSection';
import TemplateSelector from './TemplateSelector';
import CVPreviewA4 from './CVPreviewA4';
import styles from './CVEditor.module.css';

interface CVData {
  id?: string;
  title: string;
  templateId: string;
  data: {
    personalInfo: {
      fullName: string;
      email: string;
      phone: string;
      location: string;
      website?: string;
      linkedin?: string;
      summary?: string;
    };
    experience: Array<{
      id: string;
      company: string;
      position: string;
      startDate: string;
      endDate?: string;
      current: boolean;
      description: string;
      location?: string;
    }>;
    education: Array<{
      id: string;
      institution: string;
      degree: string;
      field: string;
      startDate: string;
      endDate?: string;
      current: boolean;
      gpa?: string;
      description?: string;
    }>;
    skills: Array<{
      id: string;
      name: string;
      level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
      category?: string;
    }>;
    languages: Array<{
      id: string;
      name: string;
      level: 'Basic' | 'Conversational' | 'Professional' | 'Native';
    }>;
    projects: Array<{
      id: string;
      name: string;
      description: string;
      technologies: string[];
      url?: string;
      startDate: string;
      endDate?: string;
      current: boolean;
    }>;
    certifications: Array<{
      id: string;
      name: string;
      issuer: string;
      issueDate: string;
      expiryDate?: string;
      credentialId?: string;
      url?: string;
    }>;
    volunteerExperience: Array<{
      id: string;
      organization: string;
      role: string;
      startDate: string;
      endDate?: string;
      current: boolean;
      description: string;
      cause?: string;
    }>;
  };
}

interface CVEditorProps {
  cvId?: string;
  onSave: (cv: CVData) => void;
  onCancel: () => void;
  initialData?: any; // LinkedIn imported data
  userTier?: string; // User's subscription tier
}

// Function to transform LinkedIn data to CV data format
const transformLinkedInDataToCVData = (linkedInData: any): CVData => {
  const generateId = () => Math.random().toString(36).substr(2, 9);
  
  console.log('Transforming LinkedIn data to CV format:', linkedInData);
  
  return {
    title: `${linkedInData.personalInfo?.fullName || linkedInData.personalInfo?.name || 'İmport edilən'} CV`,
    templateId: '',
    data: {
      personalInfo: {
        fullName: linkedInData.personalInfo?.fullName || linkedInData.personalInfo?.name || '',
        email: linkedInData.personalInfo?.email || '',
        phone: linkedInData.personalInfo?.phone || '',
        location: linkedInData.personalInfo?.location || '',
        website: linkedInData.personalInfo?.website || '',
        linkedin: linkedInData.personalInfo?.linkedin || '',
        summary: linkedInData.personalInfo?.summary || linkedInData.personalInfo?.headline || ''
      },
      experience: (linkedInData.experience || []).map((exp: any) => ({
        id: generateId(),
        company: exp.company || '',
        position: exp.position || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        current: exp.current || false,
        description: exp.description || '',
        location: exp.location || ''
      })),
      education: (linkedInData.education || []).map((edu: any) => ({
        id: generateId(),
        institution: edu.institution || '',
        degree: edu.degree || '',
        field: edu.field || '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || '',
        current: edu.current || false,
        gpa: edu.grade || '',
        description: edu.description || ''
      })),
      skills: (linkedInData.skills || []).map((skill: any) => ({
        id: generateId(),
        name: skill.name || '',
        level: (skill.level || 'Intermediate') as 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert',
        category: skill.category || 'General'
      })),
      languages: (linkedInData.languages || []).map((lang: any) => ({
        id: generateId(),
        name: lang.name || '',
        level: (lang.proficiency === 'Native' ? 'Native' : 
                lang.proficiency === 'Professional' ? 'Professional' : 
                lang.proficiency === 'Basic' ? 'Basic' : 'Conversational') as 'Basic' | 'Conversational' | 'Professional' | 'Native'
      })),
      projects: (linkedInData.projects || []).map((project: any) => ({
        id: generateId(),
        name: project.name || '',
        description: project.description || '',
        technologies: typeof project.technologies === 'string' ? 
          project.technologies.split(',').map((t: string) => t.trim()) : 
          (project.technologies || []),
        url: project.url || '',
        startDate: project.date || '',
        endDate: '',
        current: false
      })),
      certifications: (linkedInData.certifications || []).map((cert: any) => ({
        id: generateId(),
        name: cert.name || '',
        issuer: cert.issuer || '',
        issueDate: cert.date || '',
        expiryDate: '',
        credentialId: cert.licenseNumber || '',
        url: cert.url || ''
      })),
      volunteerExperience: (linkedInData.volunteerExperience || []).map((vol: any) => ({
        id: generateId(),
        organization: vol.organization || '',
        role: vol.role || '',
        startDate: vol.startDate || '',
        endDate: vol.endDate || '',
        current: !vol.endDate,
        description: vol.description || '',
        cause: vol.cause || ''
      }))
    }
  };
};

export default function CVEditor({ cvId, onSave, onCancel, initialData, userTier = 'Free' }: CVEditorProps) {
  const [cv, setCv] = useState<CVData>(() => {
    if (initialData) {
      return transformLinkedInDataToCVData(initialData);
    }
    return {
      title: '',
      templateId: '',
      data: {
        personalInfo: {
          fullName: '',
          email: '',
          phone: '',
          location: '',
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
        volunteerExperience: []
      }
    };
  });

  const [activeSection, setActiveSection] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState<'pdf' | 'docx' | null>(null);

  const loadCV = useCallback(async () => {
    if (!cvId) return;
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Loading CV with ID:', cvId);
      const result = await apiClient.getCV(cvId);
      console.log('CV loaded successfully:', result);
      
      // Validate the loaded CV structure
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid CV data structure');
      }
      
      if (!result.cv_data || typeof result.cv_data !== 'object') {
        throw new Error('CV data is missing or corrupted');
      }
      
      // Extract templateId from cv_data or database field
      const templateId = result.cv_data.templateId || result.templateId || '';
      
      // Transform database format to editor format
      const transformedCV = {
        id: result.id,
        title: result.title || '',
        templateId: templateId,
        data: {
          personalInfo: result.cv_data.personalInfo || {
            fullName: '',
            email: '',
            phone: '',
            location: '',
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
          volunteerExperience: Array.isArray(result.cv_data.volunteerExperience) ? result.cv_data.volunteerExperience : []
        }
      };
      
      console.log('Transformed CV for editor:', transformedCV);
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
    if (cvId) {
      loadCV();
    } else if (initialData) {
      const transformedData = transformLinkedInDataToCVData(initialData);
      setCv(transformedData);
    }
  }, [cvId, loadCV, initialData]);

  const handleSave = async () => {
    // Basic validation - only check for essential data
    const validationErrors = [];
    
    // 1. CV başlığı məcburidir
    if (!cv.title || cv.title.trim().length === 0) {
      validationErrors.push('CV başlığı tələb olunur');
    }

    // 2. Şablon seçimi məcburidir
    if (!cv.templateId || cv.templateId.trim().length === 0) {
      validationErrors.push('Şablon seçimi tələb olunur');
    }

    // 3. Şəxsi məlumatlar yoxlanılır
    if (!cv.data.personalInfo || typeof cv.data.personalInfo !== 'object') {
      validationErrors.push('Şəxsi məlumatlar tələb olunur');
    } else {
      // Yalnız ad məcburidir
      if (!cv.data.personalInfo.fullName || cv.data.personalInfo.fullName.trim().length === 0) {
        validationErrors.push('Ad tələb olunur');
      }
      
      // Email və telefon məcburi deyil, amma doldurulubsa düzgün format olmalıdır
      if (cv.data.personalInfo.email && cv.data.personalInfo.email.trim().length > 0) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cv.data.personalInfo.email)) {
          validationErrors.push('Email formatı düzgün deyil');
        }
      }
      
      if (cv.data.personalInfo.phone && cv.data.personalInfo.phone.trim().length > 0) {
        // Telefon nömrəsi ən azı 7 rəqəm olmalıdır
        const phoneRegex = /^[\d\s\-\+\(\)]{7,}$/;
        if (!phoneRegex.test(cv.data.personalInfo.phone)) {
          validationErrors.push('Telefon nömrəsi formatı düzgün deyil');
        }
      }
    }
    
    // 4. Digər bölmələr ixtiyaridir, amma doldurulubsa minimum məlumat olmalıdır
    if (cv.data.experience && cv.data.experience.length > 0) {
      cv.data.experience.forEach((exp, index) => {
        if (!exp.company || exp.company.trim().length === 0) {
          validationErrors.push(`${index + 1}-ci iş təcrübəsində şirkət adı tələb olunur`);
        }
        if (!exp.position || exp.position.trim().length === 0) {
          validationErrors.push(`${index + 1}-ci iş təcrübəsində vəzifə tələb olunur`);
        }
      });
    }
    
    if (cv.data.education && cv.data.education.length > 0) {
      cv.data.education.forEach((edu, index) => {
        if (!edu.institution || edu.institution.trim().length === 0) {
          validationErrors.push(`${index + 1}-ci təhsildə təhsil müəssisəsi tələb olunur`);
        }
        if (!edu.degree || edu.degree.trim().length === 0) {
          validationErrors.push(`${index + 1}-ci təhsildə dərəcə tələb olunur`);
        }
      });
    }
    
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      console.log('CVEditor: Starting save process...');
      console.log('CVEditor: CV object structure:', {
        title: cv.title,
        templateId: cv.templateId,
        hasData: !!cv.data,
        dataKeys: cv.data ? Object.keys(cv.data) : [],
        personalInfoExists: !!(cv.data && cv.data.personalInfo),
        personalInfoName: cv.data?.personalInfo?.fullName || 'NOT SET'
      });
      
      // Ensure all arrays are properly initialized and templateId is included
      const sanitizedData = {
        personalInfo: cv.data.personalInfo,
        experience: Array.isArray(cv.data.experience) ? cv.data.experience : [],
        education: Array.isArray(cv.data.education) ? cv.data.education : [],
        skills: Array.isArray(cv.data.skills) ? cv.data.skills : [],
        languages: Array.isArray(cv.data.languages) ? cv.data.languages : [],
        projects: Array.isArray(cv.data.projects) ? cv.data.projects : [],
        certifications: Array.isArray(cv.data.certifications) ? cv.data.certifications : [],
        volunteerExperience: Array.isArray(cv.data.volunteerExperience) ? cv.data.volunteerExperience : [],
        templateId: cv.templateId
      };

      const apiData = {
        title: cv.title,
        cv_data: sanitizedData
      };

      console.log('CVEditor: Sanitized API data:', JSON.stringify(apiData, null, 2));

      let result;
      if (cvId) {
        console.log('CVEditor: Updating existing CV with ID:', cvId);
        result = await apiClient.updateCV(cvId, apiData);
        console.log('CVEditor: CV updated successfully:', result);
        setSuccess('CV uğurla yeniləndi!');
      } else {
        console.log('CVEditor: Creating new CV...');
        result = await apiClient.createCV(apiData);
        console.log('CVEditor: CV created successfully:', result);
        setSuccess('CV uğurla yaradıldı!');
      }
      
      // Wait a moment to show success message
      setTimeout(() => {
        // Pass the CV data in the format expected by the edit page
        const cvForSave = {
          id: result.id,
          title: result.title,
          templateId: result.templateId,
          data: result.cv_data
        };
        onSave(cvForSave);
      }, 1500);
    } catch (err) {
      console.error('CVEditor: CV save error:', err);
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

  // Transform CV data from editor format to file generation format
  const transformCVDataForExport = (cvData: CVData): any => {
    return {
      personalInfo: {
        fullName: cvData.data.personalInfo.fullName,
        email: cvData.data.personalInfo.email,
        phone: cvData.data.personalInfo.phone,
        location: cvData.data.personalInfo.location,
        summary: cvData.data.personalInfo.summary,
        linkedin: cvData.data.personalInfo.linkedin,
        website: cvData.data.personalInfo.website,
      },
      experience: cvData.data.experience.map(exp => ({
        id: exp.id,
        position: exp.position,
        company: exp.company,
        startDate: exp.startDate,
        endDate: exp.current ? undefined : exp.endDate,
        location: exp.location,
        description: exp.description,
      })),
      education: cvData.data.education.map(edu => ({
        id: edu.id,
        degree: edu.degree,
        institution: edu.institution,
        startDate: edu.startDate,
        endDate: edu.current ? undefined : edu.endDate,
        gpa: edu.gpa,
      })),
      skills: cvData.data.skills.map(skill => ({
        id: skill.id,
        category: skill.category || 'General',
        items: [skill.name],
      })),
      languages: cvData.data.languages.map(lang => ({
        id: lang.id,
        language: lang.name,
        level: lang.level,
      })),
      projects: cvData.data.projects.map(proj => ({
        id: proj.id,
        name: proj.name,
        description: proj.description,
        technologies: proj.technologies,
        url: proj.url,
        startDate: proj.startDate,
        endDate: proj.current ? undefined : proj.endDate,
      })),
      certifications: cvData.data.certifications.map(cert => ({
        id: cert.id,
        name: cert.name,
        issuer: cert.issuer,
        date: cert.issueDate,
        url: cert.url,
      })),
    };
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
      // Transform the CV data to the expected format
      const transformedData = transformCVDataForExport(cv);
      
      // Start the export process
      console.log(`Starting ${format.toUpperCase()} export for CV:`, cv.id);
      console.log('Transformed data:', transformedData);
      
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

      // Handle direct download response
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

  const sections = [
    { id: 'personal', label: 'Şəxsi məlumatlar', icon: '👤' },
    { id: 'experience', label: 'İş təcrübəsi', icon: '💼' },
    { id: 'education', label: 'Təhsil', icon: '🎓' },
    { id: 'skills', label: 'Bacarıqlar', icon: '🛠️' },
    { id: 'languages', label: 'Dillər', icon: '🌐' },
    { id: 'projects', label: 'Layihələr', icon: '🚀' },
    { id: 'certifications', label: 'Sertifikatlar', icon: '🏆' },
    { id: 'volunteer', label: 'Könüllü təcrübə', icon: '❤️' },
    { id: 'template', label: 'Şablon seçimi', icon: '🎨' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={styles.pageLayout}>
      {/* Left Ad Space */}
      <div className={styles.leftAdSpace}>
        <div className={styles.adPlaceholder}>
          {/* Ad content will be injected here */}
        </div>
      </div>

      {/* Main Editor Container */}
      <div className={styles.editorContainer}>
        {/* Horizontal Editor Section - Sidebar + Form Panel */}
        <div className={styles.editorSection}>
          {/* Left Sidebar - Section Navigation */}
          <div className={styles.sidebar}>
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <input
                type="text"
                placeholder="CV başlığı..."
                value={cv.title}
                onChange={(e) => setCv(prev => ({ ...prev, title: e.target.value }))}
                className="w-full text-xl font-bold border-none outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-3 py-2 bg-white shadow-sm"
              />
            </div>
            
            <nav className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      activeSection === section.id
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                        : 'hover:bg-gray-50 text-gray-700 hover:scale-102 hover:shadow-md'
                    }`}
                  >
                    <span className="text-xl">{section.icon}</span>
                    <span className="font-medium">{section.label}</span>
                  </button>
                ))}
              </div>
            </nav>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={!cv.id || exporting !== null}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    !cv.id || exporting !== null
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700 hover:scale-105 shadow-md'
                  }`}
                >
                  {exporting === 'pdf' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 2v4h8V2h2a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h2z"/>
                    </svg>
                  )}
                  {exporting === 'pdf' ? 'PDF...' : 'PDF'}
                </button>
                
                <button
                  onClick={() => handleExport('docx')}
                  disabled={!cv.id || exporting !== null}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    !cv.id || exporting !== null
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 shadow-md'
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
                  {exporting === 'docx' ? 'DOCX...' : 'DOCX'}
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={onCancel}
                  className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:scale-105"
                >
                  Ləğv et
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all duration-200 hover:scale-105 shadow-md"
                >
                  {saving ? 'Saxlanır...' : 'Saxla'}
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Form Panel - Right of Sidebar */}
          <div className={styles.formPanel}>
            <div className="p-6">
              {/* Error Messages */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 shadow-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              )}
              
              {/* Success Messages */}
              {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 shadow-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{success}</span>
                  </div>
                </div>
              )}
              
              {/* LinkedIn Import Info */}
              {initialData && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span className="font-medium text-green-800">LinkedIn məlumatları import edildi</span>
                  </div>
                  <p className="text-sm text-green-700">
                    {initialData.personalInfo?.name ? `${initialData.personalInfo.name} profilindən` : 'LinkedIn profilindən'} məlumatlar uğurla yükləndi və CV-yə əlavə edildi.
                  </p>
                </div>
              )}
              
              {/* Dynamic Section Content */}
              <div className="space-y-6">
                {activeSection === 'personal' && (
                  <PersonalInfoSection
                    data={{
                      name: cv.data.personalInfo.fullName, // Map fullName to name
                      email: cv.data.personalInfo.email,
                      phone: cv.data.personalInfo.phone,
                      location: cv.data.personalInfo.location,
                      website: cv.data.personalInfo.website,
                      linkedin: cv.data.personalInfo.linkedin,
                      summary: cv.data.personalInfo.summary
                    }}
                    onChange={(data: any) => updateCVData('personalInfo', {
                      fullName: data.name, // Map name back to fullName
                      email: data.email,
                      phone: data.phone,
                      location: data.location,
                      website: data.website,
                      linkedin: data.linkedin,
                      summary: data.summary
                    })}
                  />
                )}
                {activeSection === 'experience' && (
                  <ExperienceSection
                    data={cv.data.experience}
                    onChange={(data: CVData['data']['experience']) => updateCVData('experience', data)}
                  />
                )}
                {activeSection === 'education' && (
                  <EducationSection
                    data={cv.data.education}
                    onChange={(data: CVData['data']['education']) => updateCVData('education', data)}
                  />
                )}
                {activeSection === 'skills' && (
                  <SkillsSection
                    data={cv.data.skills}
                    onChange={(data: CVData['data']['skills']) => updateCVData('skills', data)}
                  />
                )}
                {activeSection === 'languages' && (
                  <LanguagesSection
                    data={cv.data.languages}
                    onChange={(data: CVData['data']['languages']) => updateCVData('languages', data)}
                  />
                )}
                {activeSection === 'projects' && (
                  <ProjectsSection
                    data={cv.data.projects}
                    onChange={(data: CVData['data']['projects']) => updateCVData('projects', data)}
                  />
                )}
                {activeSection === 'certifications' && (
                  <CertificationsSection
                    data={cv.data.certifications}
                    onChange={(data: CVData['data']['certifications']) => updateCVData('certifications', data)}
                  />
                )}
                {activeSection === 'volunteer' && (
                  <VolunteerExperienceSection
                    data={cv.data.volunteerExperience}
                    onChange={(data: CVData['data']['volunteerExperience']) => updateCVData('volunteerExperience', data)}
                  />
                )}
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
        </div>

        {/* A4 Preview Section - Full Width Below Editor */}
        <div className={styles.previewSection}>
          <div className={styles.previewHeader}>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-800">📄 A4 Canlı Önizləmə</h3>
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">
                794×1123px
              </span>
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Canlı güncəllənir
            </div>
          </div>
          
          <div className={styles.previewContent}>
            <div className={styles.previewContainer}>
              {cv.templateId ? (
                <CVPreviewA4 cv={{
                  ...cv,
                  data: {
                    ...cv.data,
                    personalInfo: {
                      ...cv.data.personalInfo,
                      name: cv.data.personalInfo.fullName // Map fullName to name for preview
                    }
                  }
                }} />
              ) : (
                <div className={styles.previewEmptyState}>
                  <svg className={styles.previewEmptyIcon} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                    <path d="M14 2v6h6"/>
                  </svg>
                  <h3 className="text-lg font-medium mb-2 text-gray-600">Şablon Seçin</h3>
                  <p className="text-sm text-gray-500">CV önizləməsini görmək üçün bir şablon seçin</p>
                  <button
                    onClick={() => setActiveSection('template')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Şablon Seç
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Export disclaimer */}
          {cv.id && (
            <div className={styles.exportDisclaimer}>
              <span className={styles.exportDisclaimerIcon}>💡</span>
              <div className={styles.exportDisclaimerText}>
                <strong>Export məlumatı:</strong> Önizləmə tam hazır olmaya bilər, ancaq export edilən faylda bütün məlumatlarınız düzgün görünəcək.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Ad Space */}
      <div className={styles.rightAdSpace}>
        <div className={styles.adPlaceholder}>
          {/* Ad content will be injected here */}
        </div>
      </div>
    </div>
  );
}
