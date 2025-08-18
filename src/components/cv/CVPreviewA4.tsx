'use client';

import React, { useState, useEffect, useCallback } from 'react';

// =======================================================================
// FONT MANAGER (test1-dən inteqrasiya olunub)
// =======================================================================
// Bu hook, CV üçün şrift ayarlarını idarə edir.
// Əgər lokal yaddaşda saxlanmış ayarlar varsa, onları istifadə edir.
const useFontSettings = (cvId: string | undefined) => {
    const [fontSettings, setFontSettings] = useState({
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
    });

    useEffect(() => {
        if (cvId) {
            try {
                const savedSettings = localStorage.getItem(`font-settings-${cvId}`);
                if (savedSettings) {
                    setFontSettings(JSON.parse(savedSettings));
                }
            } catch (error) {
                console.error("Şrift ayarlarını yükləmək alınmadı:", error);
            }
        }
    }, [cvId]);

    return { fontSettings };
};


// =======================================================================
// TRANSLATE FUNCTIONS (test1-dən inteqrasiya olunub)
// =======================================================================
type CVLanguage = 'azerbaijani' | 'english';

const translations = {
    // Ümumi etiketlər
    summary: { azerbaijani: 'Peşəkar Özət', english: 'Professional Summary' },
    experience: { azerbaijani: 'İş Təcrübəsi', english: 'Work Experience' },
    education: { azerbaijani: 'Təhsil', english: 'Education' },
    skills: { azerbaijani: 'Bacarıqlar', english: 'Skills' },
    hardSkills: { azerbaijani: 'Texniki Bacarıqlar', english: 'Hard Skills' },
    softSkills: { azerbaijani: 'Yumşaq Bacarıqlar', english: 'Soft Skills' },
    projects: { azerbaijani: 'Layihələr', english: 'Projects' },
    technologies: { azerbaijani: 'Texnologiyalar', english: 'Technologies' },
    languages: { azerbaijani: 'Dillər', english: 'Languages' },
    certifications: { azerbaijani: 'Sertifikatlar', english: 'Certifications' },
    volunteerExperience: { azerbaijani: 'Könüllü Təcrübəsi', english: 'Volunteer Experience' },
    references: { azerbaijani: 'İstinadlar', english: 'References' },
    present: { azerbaijani: 'İndi', english: 'Present' },
    to: { azerbaijani: '-', english: 'to' },
    GPA: { azerbaijani: 'GPA', english: 'GPA' },
    fieldOfStudy: { azerbaijani: 'İxtisas Sahəsi', english: 'Field of Study' },

    // Dil səviyyələri
    languageLevels: {
        beginner: { azerbaijani: 'Başlanğıc', english: 'Beginner' },
        elementary: { azerbaijani: 'Elementar', english: 'Elementary' },
        intermediate: { azerbaijani: 'Orta', english: 'Intermediate' },
        upper_intermediate: { azerbaijani: 'Yüksək-Orta', english: 'Upper-Intermediate' },
        advanced: { azerbaijani: 'Qabaqcıl', english: 'Advanced' },
        proficient: { azerbaijani: 'Peşəkar', english: 'Proficient' },
        native: { azerbaijani: 'Ana dili', english: 'Native' },
    },

    // Təhsil dərəcələri
    degrees: {
        high_school: { azerbaijani: 'Orta Məktəb', english: 'High School' },
        bachelor: { azerbaijani: 'Bakalavr', english: 'Bachelor' },
        master: { azerbaijani: 'Magistr', english: 'Master' },
        phd: { azerbaijani: 'Doktorantura', english: 'PhD' },
    }
};

// Etiketləri tərcümə etmək üçün funksiya
const getLabel = (key: keyof typeof translations, language: CVLanguage): string => {
    const entry = translations[key];
    if (entry && typeof entry === 'object' && language in entry) {
        return (entry as Record<CVLanguage, string>)[language];
    }
    return key;
};

// Dil səviyyəsini tərcümə etmək üçün funksiya
const translateLanguageLevel = (level: string, language: CVLanguage): string => {
    const key = level.toLowerCase().replace(' ', '_') as keyof typeof translations.languageLevels;
    const entry = translations.languageLevels[key];
    if (entry) {
        return entry[language];
    }
    return level;
};

// Təhsil dərəcəsini tərcümə etmək üçün funksiya
const translateDegree = (degree: string, language: CVLanguage): string => {
    const key = degree.toLowerCase().replace(' ', '_') as keyof typeof translations.degrees;
    const entry = translations.degrees[key];
    if (entry) {
        return entry[language];
    }
    return degree;
};

// Tarix aralığını formatlamaq üçün funksiya
const formatDate = (dateString: string, language: CVLanguage): string => {
    if (!dateString) return '';
    try {
        return new Date(dateString).toLocaleDateString(language === 'english' ? 'en-US' : 'az-AZ', {
            year: 'numeric',
            month: 'long'
        });
    } catch {
        return dateString;
    }
};

const formatExperienceDateRange = (startDate: string, endDate: string | undefined, current: boolean, language: CVLanguage): string => {
    const start = formatDate(startDate, language);
    if (current) return `${start} – ${getLabel('present', language)}`;
    return endDate ? `${start} – ${formatDate(endDate, language)}` : start;
};


// Utility function to safely render HTML content
const stripHtmlTags = (html: string): string => {
    if (!html) return '';
    return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<p[^>]*>/gi, '')
        .replace(/<\/div>/gi, '\n')
        .replace(/<div[^>]*>/gi, '')
        .replace(/<\/h[1-6]>/gi, '\n')
        .replace(/<h[1-6][^>]*>/gi, '')
        .replace(/<\/li>/gi, '\n')
        .replace(/<li[^>]*>/gi, '• ')
        .replace(/<\/ul>/gi, '\n')
        .replace(/<ul[^>]*>/gi, '')
        .replace(/<\/ol>/gi, '\n')
        .replace(/<ol[^>]*>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/gi, ' ')
        .trim();
};

// Interfaces for CV data structure
interface CVData {
    id?: string;
    title: string;
    templateId: 'resume-ats' | 'medium-professional' | string;
    data: {
        personalInfo: {
            name?: string;
            fullName?: string;
            email?: string;
            phone?: string;
            location?: string;
            website?: string;
            linkedin?: string;
            github?: string;
            summary?: string;
            title?: string;
            profileImage?: string;
        };
        experience?: Array<{
            id: string;
            company: string;
            position: string;
            startDate: string;
            endDate?: string;
            current: boolean;
            description: string;
            location?: string;
        }>;
        education?: Array<{
            id: string;
            institution: string;
            degree: string;
            field?: string;
            startDate: string;
            endDate?: string;
            current: boolean;
            gpa?: string;
            description?: string;
        }>;
        skills?: Array<{
            id?: string;
            name: string;
            category?: string;
            level?: string;
            type?: 'hard' | 'soft';
        }>;
        languages?: Array<{
            id?: string;
            language?: string;
            name?: string;
            level?: string;
            proficiency?: string;
        }>;
        projects?: Array<{
            id: string;
            name: string;
            description: string;
            technologies?: string | string[];
            startDate?: string;
            endDate?: string;
            url?: string;
        }>;
        certifications?: Array<{
            id: string;
            name: string;
            issuer: string;
            date?: string;
            issueDate?: string;
            expiryDate?: string;
            credentialId?: string;
            url?: string;
            description?: string;
        }>;
        volunteerExperience?: Array<{
            id: string;
            organization: string;
            role: string;
            startDate: string;
            endDate?: string;
            current: boolean;
            description?: string;
            cause?: string;
        }>;
        references?: Array<{
            id: string;
            name: string;
            title?: string;
            company?: string;
            email?: string;
            phone?: string;
            relationship?: string;
        }>;
        customSections?: Array<{
            id: string;
            title: string;
            content?: string;
            description?: string;
            type?: 'simple' | 'detailed' | 'timeline';
            isVisible?: boolean;
            priority?: number;
            items?: Array<{
                id: string;
                title: string;
                description?: string;
                date?: string;
                location?: string;
                url?: string;
            }>;
        }>;
        sectionOrder?: Array<{
            id: string;
            type: string;
            isVisible: boolean;
            order?: number;
        }>;
        cvLanguage?: CVLanguage;
    };
}

interface CVPreviewProps {
    cv: CVData;
    onSectionOrderChange?: (sections: any[]) => void;
}

interface SectionConfig {
    id: string;
    name: string;
    displayName: string;
    isVisible: boolean;
    order: number;
    hasData: boolean;
    icon: string;
}

// Default section configuration
const DEFAULT_SECTIONS = [
    { id: 'personalInfo', name: 'personalInfo', displayName: 'Personal Information', displayNameAz: 'Şəxsi Məlumatlar', icon: '👤', alwaysVisible: true },
    { id: 'summary', name: 'summary', displayName: 'Professional Summary', displayNameAz: 'Peşəkar Özət', icon: '📝', alwaysVisible: false },
    { id: 'experience', name: 'experience', displayName: 'Work Experience', displayNameAz: 'İş Təcrübəsi', icon: '💼', alwaysVisible: false },
    { id: 'education', name: 'education', displayName: 'Education', displayNameAz: 'Təhsil', icon: '🎓', alwaysVisible: false },
    { id: 'skills', name: 'skills', displayName: 'Skills', displayNameAz: 'Bacarıqlar', icon: '⚡', alwaysVisible: false },
    { id: 'projects', name: 'projects', displayName: 'Projects', displayNameAz: 'Layihələr', icon: '🚀', alwaysVisible: false },
    { id: 'certifications', name: 'certifications', displayName: 'Certifications', displayNameAz: 'Sertifikatlar', icon: '🏆', alwaysVisible: false },
    { id: 'languages', name: 'languages', displayName: 'Languages', displayNameAz: 'Dillər', icon: '🌍', alwaysVisible: false },
    { id: 'volunteerExperience', name: 'volunteerExperience', displayName: 'Volunteer Experience', displayNameAz: 'Könüllü İş', icon: '❤️', alwaysVisible: false },
    { id: 'references', name: 'references', displayName: 'References', displayNameAz: 'İstinadlar', icon: '👥', alwaysVisible: false },
    { id: 'customSections', name: 'customSections', displayName: 'Additional Sections', displayNameAz: 'Əlavə Bölmələr', icon: '📋', alwaysVisible: false }
];

// --- Resume ATS Template Component ---
const ResumeATSTemplate: React.FC<CVPreviewProps> = ({ cv, onSectionOrderChange }) => {
    const { data } = cv;
    const currentLanguage = data.cvLanguage || 'azerbaijani';
    const { fontSettings } = useFontSettings(cv.id);

    const [draggedSection, setDraggedSection] = useState<string | null>(null);
    const [dragOverSection, setDragOverSection] = useState<string | null>(null);
    const [sections, setSections] = useState<SectionConfig[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const hasData = useCallback((sectionId: string): boolean => {
        if (sectionId === 'personalInfo') return true;
        if (sectionId === 'summary') return !!data.personalInfo?.summary;

        const sectionData = data?.[sectionId as keyof typeof data];
        return Array.isArray(sectionData) ? sectionData.length > 0 : !!sectionData;
    }, [data]);

    useEffect(() => {
        if (!mounted) return;

        const currentSectionOrder = data?.sectionOrder || [];
        const initializedSections = DEFAULT_SECTIONS.map((defaultSection, index) => {
            const existingConfig = currentSectionOrder.find((s: any) => s.id === defaultSection.id);
            return {
                id: defaultSection.id,
                name: defaultSection.name,
                displayName: currentLanguage === 'english' ? defaultSection.displayName : defaultSection.displayNameAz,
                isVisible: existingConfig?.isVisible ?? (hasData(defaultSection.id) || defaultSection.alwaysVisible),
                order: existingConfig?.order ?? index,
                hasData: hasData(defaultSection.id),
                icon: defaultSection.icon
            };
        });

        const sectionsToShow = initializedSections
            .filter(section => hasData(section.id))
            .sort((a, b) => a.order - b.order);

        setSections(sectionsToShow);
    }, [mounted, data, currentLanguage, hasData]);

    const handleDragStart = useCallback((e: React.DragEvent, sectionId: string) => { setDraggedSection(sectionId); }, []);
    const handleDragOver = useCallback((e: React.DragEvent, sectionId: string) => { e.preventDefault(); if (sectionId !== draggedSection) setDragOverSection(sectionId); }, [draggedSection]);
    const handleDrop = useCallback((e: React.DragEvent, targetSectionId: string) => {
        if (!draggedSection || draggedSection === targetSectionId) {
            setDraggedSection(null);
            setDragOverSection(null);
            return;
        }
        const draggedIndex = sections.findIndex(s => s.id === draggedSection);
        const targetIndex = sections.findIndex(s => s.id === targetSectionId);
        if (draggedIndex !== -1 && targetIndex !== -1) {
            const newSections = [...sections];
            const [draggedItem] = newSections.splice(draggedIndex, 1);
            newSections.splice(targetIndex, 0, draggedItem);
            const updatedSections = newSections.map((s, i) => ({ ...s, order: i }));
            setSections(updatedSections);
            if (onSectionOrderChange) onSectionOrderChange(updatedSections);
        }
        setDraggedSection(null);
        setDragOverSection(null);
    }, [draggedSection, sections, onSectionOrderChange]);
    const handleDragEnd = useCallback(() => { setDraggedSection(null); setDragOverSection(null); }, []);

    const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2 text-gray-600"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
    const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2 text-gray-600"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;
    const LinkedinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2 text-gray-600"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>;
    const LocationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2 text-gray-600"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
    const SectionTitle = ({ title }: { title: string }) => <h2 className="text-sm font-bold uppercase text-gray-600 tracking-wider pb-2 mb-4 border-b border-gray-200">{title}</h2>;

    const hardSkills = data.skills?.filter(skill => skill.type === 'hard' || !skill.type) || [];
    const softSkills = data.skills?.filter(skill => skill.type === 'soft') || [];

    const DraggableSection: React.FC<{ sectionId: string, children: React.ReactNode }> = ({ sectionId, children }) => {
        const isDragged = draggedSection === sectionId;
        const isDraggedOver = dragOverSection === sectionId && draggedSection !== sectionId;
        return (
            <div
                draggable
                onDragStart={(e) => handleDragStart(e, sectionId)}
                onDragOver={(e) => handleDragOver(e, sectionId)}
                onDrop={(e) => handleDrop(e, sectionId)}
                onDragEnd={handleDragEnd}
                className={`relative group cursor-move transition-all duration-200 ${isDragged ? 'scale-105 rotate-1 z-50' : ''} ${isDraggedOver ? 'ring-2 ring-blue-400 bg-blue-50 rounded-lg' : ''} hover:shadow-md rounded-lg p-2 -m-2`}
            >
                {children}
            </div>
        );
    };

    const renderSectionContent = (sectionId: string) => {
        switch (sectionId) {
            case 'summary':
                return data.personalInfo?.summary && (
                    <section>
                        <SectionTitle title={getLabel('summary', currentLanguage)} />
                        <p className="text-gray-600 text-base leading-relaxed">{stripHtmlTags(data.personalInfo.summary)}</p>
                    </section>
                );
            case 'skills':
                return data.skills && data.skills.length > 0 && (
                    <section>
                        <SectionTitle title={getLabel('skills', currentLanguage)} />
                        <div className="space-y-4">
                            {hardSkills.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-gray-700 mb-2">{getLabel('hardSkills', currentLanguage)}</h3>
                                    <ul className="space-y-2 text-gray-700">{hardSkills.map((skill, index) => <li key={skill.id || index}>{stripHtmlTags(skill.name)}</li>)}</ul>
                                </div>
                            )}
                            {softSkills.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-gray-700 mb-2 mt-4">{getLabel('softSkills', currentLanguage)}</h3>
                                    <ul className="space-y-2 text-gray-700">{softSkills.map((skill, index) => <li key={skill.id || index}>{stripHtmlTags(skill.name)}</li>)}</ul>
                                </div>
                            )}
                        </div>
                    </section>
                );
            case 'education':
                return data.education && data.education.length > 0 && (
                    <section>
                        <SectionTitle title={getLabel('education', currentLanguage)} />
                        <div className="text-gray-700">{data.education.map((edu) => <div key={edu.id} className="mb-6"><h3 className="font-bold text-lg">{stripHtmlTags(edu.institution)}</h3><p className="font-semibold">{translateDegree(edu.degree, currentLanguage)}{edu.field && ` - ${stripHtmlTags(edu.field)}`}</p><p className="text-sm text-gray-500">{formatExperienceDateRange(edu.startDate, edu.endDate, edu.current, currentLanguage)}</p>{edu.gpa && <p className="text-sm text-gray-500">{getLabel('GPA', currentLanguage)}: {stripHtmlTags(edu.gpa)}</p>}{edu.description && <ul className="list-disc list-inside mt-2 space-y-2 text-sm">{stripHtmlTags(edu.description).split('\n').map((line, index) => line.trim() && <li key={index}>{line}</li>)}</ul>}</div>)}</div>
                    </section>
                );
            case 'experience':
                return data.experience && data.experience.length > 0 && (
                    <section>
                        <SectionTitle title={getLabel('experience', currentLanguage)} />
                        <div className="space-y-6">{data.experience.map((job) => <div key={job.id}><h3 className="text-lg font-bold text-gray-800">{stripHtmlTags(job.company)}{job.location && `, ${stripHtmlTags(job.location)}`}</h3><div className="flex justify-between items-baseline"><p className="font-semibold text-gray-700">{stripHtmlTags(job.position)}</p><p className="text-sm text-gray-500">{formatExperienceDateRange(job.startDate, job.endDate, job.current, currentLanguage)}</p></div>{job.description && <ul className="list-disc list-inside mt-2 space-y-2 text-gray-600">{stripHtmlTags(job.description).split('\n').map((duty, i) => duty.trim() && <li key={i}>{duty.startsWith('•') ? duty.substring(1).trim() : duty}</li>)}</ul>}</div>)}</div>
                    </section>
                );
            case 'projects':
                return data.projects && data.projects.length > 0 && (
                    <section>
                        <SectionTitle title={getLabel('projects', currentLanguage)} />
                        <div className="space-y-6">{data.projects.map((project) => <div key={project.id}><h3 className="text-lg font-bold text-gray-800">{stripHtmlTags(project.name)}</h3>{(project.startDate || project.endDate) && <p className="text-sm text-gray-500">{project.startDate && project.endDate && `${formatDate(project.startDate, currentLanguage)} - ${formatDate(project.endDate, currentLanguage)}`}{project.startDate && !project.endDate && formatDate(project.startDate, currentLanguage)}</p>}{project.description && <p className="mt-2 text-gray-600">{stripHtmlTags(project.description)}</p>}{project.technologies && <p className="mt-1 text-sm text-gray-500">{getLabel('technologies', currentLanguage)}: {Array.isArray(project.technologies) ? project.technologies.join(', ') : project.technologies}</p>}</div>)}</div>
                    </section>
                );
            case 'languages':
                return data.languages && data.languages.length > 0 && (
                    <section>
                        <SectionTitle title={getLabel('languages', currentLanguage)} />
                        <ul className="space-y-2 text-gray-700">{data.languages.map((lang, index) => <li key={lang.id || index}>{lang.language || lang.name} - {translateLanguageLevel(lang.level || lang.proficiency || '', currentLanguage)}</li>)}</ul>
                    </section>
                );
            case 'certifications':
                return data.certifications && data.certifications.length > 0 && (
                    <section>
                        <SectionTitle title={getLabel('certifications', currentLanguage)} />
                        <div className="space-y-4">{data.certifications.map(cert => <div key={cert.id}><h3 className="font-semibold text-gray-800">{cert.name}</h3><p className="text-sm text-gray-600">{cert.issuer}</p>{cert.date && <p className="text-sm text-gray-500">{formatDate(cert.date, currentLanguage)}</p>}</div>)}</div>
                    </section>
                );
            case 'volunteerExperience':
                return data.volunteerExperience && data.volunteerExperience.length > 0 && (
                    <section>
                        <SectionTitle title={getLabel('volunteerExperience', currentLanguage)} />
                        <div className="space-y-4">{data.volunteerExperience.map(vol => <div key={vol.id}><h3 className="font-semibold text-gray-800">{vol.role} at {vol.organization}</h3><p className="text-sm text-gray-500">{formatExperienceDateRange(vol.startDate, vol.endDate, vol.current, currentLanguage)}</p>{vol.description && <p className="text-sm text-gray-600 mt-1">{stripHtmlTags(vol.description)}</p>}</div>)}</div>
                    </section>
                );
            case 'references':
                return data.references && data.references.length > 0 && (
                    <section>
                        <SectionTitle title={getLabel('references', currentLanguage)} />
                        <p className="text-sm text-gray-600">{currentLanguage === 'english' ? 'Available upon request' : 'Tələb olunduqda təqdim ediləcək'}</p>
                    </section>
                );
            case 'customSections':
                return data.customSections && data.customSections.length > 0 && (
                    <>
                        {data.customSections.map(section => (
                            <section key={section.id}>
                                <SectionTitle title={section.title} />
                                <div className="text-gray-600">{stripHtmlTags(section.content || section.description || '')}</div>
                            </section>
                        ))}
                    </>
                );
            default:
                return null;
        }
    };

    const asideSectionIds = ['skills', 'education', 'languages', 'certifications', 'volunteerExperience', 'references'];
    const mainSectionIds = ['summary', 'experience', 'projects', 'customSections'];
    const sectionsForAside = sections.filter(s => asideSectionIds.includes(s.id));
    const sectionsForMain = sections.filter(s => mainSectionIds.includes(s.id));

    if (!mounted) return <div className="min-h-screen bg-white"></div>;

    return (
        <div className="font-sans bg-gray-100 h-full overflow-y-auto p-4 md:p-8" style={{ fontFamily: fontSettings.fontFamily, fontSize: fontSettings.fontSize }}>
            <div className="w-full max-w-4xl bg-white shadow-lg p-8 md:p-12">
                <header className="flex flex-col md:flex-row justify-between items-start mb-10">
                    <div className="md:w-3/4">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">{stripHtmlTags(data.personalInfo?.name || data.personalInfo?.fullName || '')}</h1>
                        <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mt-2">{stripHtmlTags(data.personalInfo?.title || 'Professional')}</h2>
                    </div>
                    <div className="text-left md:text-right mt-6 md:mt-0 text-sm text-gray-600 w-full md:w-auto space-y-1">
                        {data.personalInfo?.location && <p className="flex items-center justify-start md:justify-end"><LocationIcon /> {stripHtmlTags(data.personalInfo.location)}</p>}
                        {data.personalInfo?.phone && <p className="flex items-center justify-start md:justify-end"><PhoneIcon /> {stripHtmlTags(data.personalInfo.phone)}</p>}
                        {data.personalInfo?.email && <a href={`mailto:${data.personalInfo.email}`} className="mt-1 text-blue-600 hover:underline flex items-center justify-start md:justify-end"><MailIcon /> {stripHtmlTags(data.personalInfo.email)}</a>}
                        {data.personalInfo?.linkedin && <a href={data.personalInfo.linkedin.startsWith('http') ? data.personalInfo.linkedin : `https://${data.personalInfo.linkedin}`} target="_blank" rel="noopener noreferrer" className="mt-1 text-blue-600 hover:underline flex items-center justify-start md:justify-end"><LinkedinIcon /> {stripHtmlTags(data.personalInfo.linkedin)}</a>}
                    </div>
                </header>
                <main className="flex flex-col md:flex-row-reverse gap-12">
                    <aside className="w-full md:w-1/3 space-y-8">
                        {sectionsForAside.map(section => (
                            <DraggableSection key={section.id} sectionId={section.id}>
                                {renderSectionContent(section.id)}
                            </DraggableSection>
                        ))}
                    </aside>
                    <div className="w-full md:w-2/3 space-y-8">
                        {sectionsForMain.map(section => (
                            <DraggableSection key={section.id} sectionId={section.id}>
                                {renderSectionContent(section.id)}
                            </DraggableSection>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};


// --- Medium Professional Template Component ---
const MediumProfessionalTemplate: React.FC<CVPreviewProps> = ({ cv, onSectionOrderChange }) => {
    const { data } = cv;
    const currentLanguage = data.cvLanguage || 'azerbaijani';
    const { fontSettings } = useFontSettings(cv.id);

    const [draggedSection, setDraggedSection] = useState<string | null>(null);
    const [dragOverSection, setDragOverSection] = useState<string | null>(null);
    const [sections, setSections] = useState<SectionConfig[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const hasData = useCallback((sectionId: string): boolean => {
        if (sectionId === 'personalInfo') return true;
        if (sectionId === 'summary') return !!data.personalInfo?.summary;
        const sectionData = data?.[sectionId as keyof typeof data];
        return Array.isArray(sectionData) ? sectionData.length > 0 : !!sectionData;
    }, [data]);

    useEffect(() => {
        if (!mounted) return;
        const currentSectionOrder = data?.sectionOrder || [];
        const initializedSections = DEFAULT_SECTIONS.map((defaultSection, index) => {
            const existingConfig = currentSectionOrder.find((s: any) => s.id === defaultSection.id);
            return {
                id: defaultSection.id,
                name: defaultSection.name,
                displayName: currentLanguage === 'english' ? defaultSection.displayName : defaultSection.displayNameAz,
                isVisible: existingConfig?.isVisible ?? (hasData(defaultSection.id) || defaultSection.alwaysVisible),
                order: existingConfig?.order ?? index,
                hasData: hasData(defaultSection.id),
                icon: defaultSection.icon
            };
        });
        const sectionsToShow = initializedSections.filter(s => hasData(s.id)).sort((a, b) => a.order - b.order);
        setSections([...sectionsToShow]);
    }, [mounted, data, hasData, currentLanguage]);

    const handleDragStart = useCallback((e: React.DragEvent, sectionId: string) => { setDraggedSection(sectionId); }, []);
    const handleDragOver = useCallback((e: React.DragEvent, sectionId: string) => { e.preventDefault(); if (sectionId !== draggedSection) setDragOverSection(sectionId); }, [draggedSection]);
    const handleDrop = useCallback((e: React.DragEvent, targetSectionId: string) => {
        if (!draggedSection || draggedSection === targetSectionId) {
            setDraggedSection(null); setDragOverSection(null); return;
        }
        const draggedIndex = sections.findIndex(s => s.id === draggedSection);
        const targetIndex = sections.findIndex(s => s.id === targetSectionId);
        if (draggedIndex !== -1 && targetIndex !== -1) {
            const newSections = [...sections];
            const [draggedItem] = newSections.splice(draggedIndex, 1);
            newSections.splice(targetIndex, 0, draggedItem);
            const updatedSections = newSections.map((s, i) => ({ ...s, order: i }));
            setSections(updatedSections);
            if (onSectionOrderChange) onSectionOrderChange(updatedSections);
        }
        setDraggedSection(null); setDragOverSection(null);
    }, [draggedSection, sections, onSectionOrderChange]);
    const handleDragEnd = useCallback(() => { setDraggedSection(null); setDragOverSection(null); }, []);

    const DraggableSection: React.FC<{ sectionId: string, children: React.ReactNode }> = ({ sectionId, children }) => {
        const isDragged = draggedSection === sectionId;
        const isDraggedOver = dragOverSection === sectionId && draggedSection !== sectionId;
        const dragDropText = {
            drag: currentLanguage === 'english' ? 'Drag' : 'Sürükləyin',
            drop: currentLanguage === 'english' ? 'Drop here' : 'Buraya burax'
        }
        return (
            <div
                draggable onDragStart={(e) => handleDragStart(e, sectionId)} onDragOver={(e) => handleDragOver(e, sectionId)} onDrop={(e) => handleDrop(e, sectionId)} onDragEnd={handleDragEnd}
                className={`relative group cursor-move transition-all duration-200 ${isDragged ? 'scale-105 rotate-1 z-50' : ''} ${isDraggedOver ? 'ring-2 ring-blue-400 bg-blue-50 rounded-lg' : ''} hover:shadow-md rounded-lg p-2 m-1`}
            >
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-700 text-white px-2 py-1 rounded text-xs">{dragDropText.drag}</div>
                {isDraggedOver && <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded-lg bg-blue-100 bg-opacity-50 flex items-center justify-center pointer-events-none z-10"><div className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium animate-bounce">🎯 {dragDropText.drop}</div></div>}
                {children}
            </div>
        );
    };

    const hardSkills = data.skills?.filter(skill => skill.type === 'hard' || !skill.type) || [];
    const softSkills = data.skills?.filter(skill => skill.type === 'soft') || [];

    return (
        <div className="w-full h-full bg-white text-gray-900 overflow-y-auto" style={{ fontFamily: fontSettings.fontFamily, fontSize: fontSettings.fontSize }}>
            {draggedSection && <div className="sticky top-0 z-50 bg-blue-500 text-white p-2 text-center text-sm">{currentLanguage === 'english' ? `🔄 Dragging "${DEFAULT_SECTIONS.find(s => s.id === draggedSection)?.displayName}"...` : `🔄 "${DEFAULT_SECTIONS.find(s => s.id === draggedSection)?.displayNameAz}" sürüklənir...`}</div>}
            <div className="p-8">
                <header className="text-center border-b-2 border-gray-200 pb-6 mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{data.personalInfo.name || data.personalInfo.fullName || 'Your Name'}</h1>
                    <h2 className="text-xl font-light text-gray-600 tracking-widest uppercase">{data.personalInfo.title || 'Professional Title'}</h2>
                    <div className="flex justify-center gap-x-6 gap-y-2 flex-wrap mt-4 text-sm text-gray-600">
                        {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
                        {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
                        {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
                        {data.personalInfo.linkedin && <span>{data.personalInfo.linkedin}</span>}
                    </div>
                </header>
                <div className="space-y-8">
                    {sections.map((section) => {
                        const sectionContent = () => {
                            switch (section.id) {
                                case 'summary':
                                    return data.personalInfo.summary && <section><h2 className="text-xl font-semibold text-gray-900 mb-4">{getLabel('summary', currentLanguage).toUpperCase()}</h2><p className="text-sm text-gray-700 leading-relaxed">{stripHtmlTags(data.personalInfo.summary)}</p></section>;
                                case 'experience':
                                    return data.experience?.length > 0 && <section><h2 className="text-xl font-semibold text-gray-900 mb-4">{getLabel('experience', currentLanguage).toUpperCase()}</h2><div className="space-y-6">{data.experience.map(exp => <div key={exp.id} className="pl-4 border-l-2 border-blue-500"><div className="flex justify-between items-start mb-1"><div><h3 className="font-semibold text-gray-800">{exp.position}</h3><p className="text-gray-600">{exp.company}</p></div><span className="text-sm text-gray-500 whitespace-nowrap pl-4">{formatExperienceDateRange(exp.startDate, exp.endDate, exp.current, currentLanguage)}</span></div>{exp.location && <p className="text-sm text-gray-500 mb-2">{exp.location}</p>}{exp.description && <p className="text-sm text-gray-700 leading-relaxed mt-2">{stripHtmlTags(exp.description)}</p>}</div>)}</div></section>;
                                case 'education':
                                    return data.education?.length > 0 && <section><h2 className="text-xl font-semibold text-gray-900 mb-4">{getLabel('education', currentLanguage).toUpperCase()}</h2><div className="space-y-4">{data.education.map(edu => <div key={edu.id} className="pl-4 border-l-2 border-green-500"><div className="flex justify-between items-start mb-1"><div><h3 className="font-semibold text-gray-800">{translateDegree(edu.degree, currentLanguage)}</h3><p className="text-gray-600">{edu.institution}</p></div><span className="text-sm text-gray-500 whitespace-nowrap pl-4">{formatExperienceDateRange(edu.startDate, edu.endDate, edu.current, currentLanguage)}</span></div>{edu.field && <p className="text-sm text-gray-500">{edu.field}</p>}{edu.gpa && <p className="text-sm text-gray-500">{getLabel('GPA', currentLanguage)}: {edu.gpa}</p>}</div>)}</div></section>;
                                case 'skills':
                                    return data.skills?.length > 0 && <section><h2 className="text-xl font-semibold text-gray-900 mb-4">{getLabel('skills', currentLanguage).toUpperCase()}</h2><div className="space-y-4">{hardSkills.length > 0 && <div><h3 className="text-md font-semibold text-gray-700 mb-2">{getLabel('hardSkills', currentLanguage)}</h3><div className="flex flex-wrap gap-2">{hardSkills.map((skill, index) => <span key={skill.id || index} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">{skill.name}</span>)}</div></div>}{softSkills.length > 0 && <div><h3 className="text-md font-semibold text-gray-700 mb-2">{getLabel('softSkills', currentLanguage)}</h3><div className="flex flex-wrap gap-2">{softSkills.map((skill, index) => <span key={skill.id || index} className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">{skill.name}</span>)}</div></div>}</div></section>;
                                case 'projects':
                                    return data.projects?.length > 0 && <section><h2 className="text-xl font-semibold text-gray-900 mb-4">{getLabel('projects', currentLanguage).toUpperCase()}</h2><div className="space-y-6">{data.projects.map(proj => <div key={proj.id} className="pl-4 border-l-2 border-purple-500"><h3 className="font-semibold text-gray-800">{proj.name}</h3><p className="text-sm text-gray-700 leading-relaxed mt-1">{stripHtmlTags(proj.description)}</p></div>)}</div></section>;
                                case 'certifications':
                                    return data.certifications?.length > 0 && <section><h2 className="text-xl font-semibold text-gray-900 mb-4">{getLabel('certifications', currentLanguage).toUpperCase()}</h2><div className="space-y-4">{data.certifications.map(cert => <div key={cert.id}><h3 className="font-semibold text-gray-800">{cert.name} - <span className="font-normal text-gray-600">{cert.issuer}</span></h3></div>)}</div></section>;
                                case 'languages':
                                    return data.languages?.length > 0 && <section><h2 className="text-xl font-semibold text-gray-900 mb-4">{getLabel('languages', currentLanguage).toUpperCase()}</h2><div className="flex flex-wrap gap-4">{data.languages.map(lang => <div key={lang.id}><span className="font-semibold">{lang.language || lang.name}</span>: <span className="text-gray-600">{translateLanguageLevel(lang.level || lang.proficiency || '', currentLanguage)}</span></div>)}</div></section>;
                                default: return null;
                            }
                        };
                        const content = sectionContent();
                        return content ? <DraggableSection key={section.id} sectionId={section.id}>{content}</DraggableSection> : null;
                    })}
                </div>
            </div>
        </div>
    );
};

// --- Main CV Preview Router Component ---
export default function CVPreview({ cv, onSectionOrderChange }: CVPreviewProps) {
    if (!cv || !cv.templateId) {
        return <div className="flex items-center justify-center h-full bg-gray-100"><p>Loading CV...</p></div>;
    }

    switch (cv.templateId) {
        case 'resume-ats':
            return <ResumeATSTemplate cv={cv} onSectionOrderChange={onSectionOrderChange} />;
        case 'medium-professional':
            return <MediumProfessionalTemplate cv={cv} onSectionOrderChange={onSectionOrderChange} />;
        default:
            return <MediumProfessionalTemplate cv={cv} onSectionOrderChange={onSectionOrderChange} />;
    }
}
