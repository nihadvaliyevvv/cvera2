'use client';

import { useState, useEffect } from 'react';
import { getLabel } from '@/lib/cvLanguage';

interface PersonalInfo {
  fullName: string; // Changed from 'name' to 'fullName'
  email: string;
  phone: string;
  website?: string;
  linkedin?: string;
  summary?: string;
  profileImage?: string; // Premium feature
}

interface PersonalInfoSectionProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
  userTier?: string; // User tier for premium features
  cvData?: any; // Full CV data for AI summary
}

export default function PersonalInfoSection({ data, onChange, userTier = 'Free', cvData }: PersonalInfoSectionProps) {
  const [imageUploading, setImageUploading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const isPremium = userTier === 'Premium';
  const canUseAI = userTier === 'Premium' || userTier === 'Medium';

  // Form validasiya mesajlarını Azərbaycan dilinə çevirmək
  useEffect(() => {
    const setCustomValidationMessages = () => {
      const fullNameInput = document.getElementById('fullName') as HTMLInputElement;
      const emailInput = document.getElementById('email') as HTMLInputElement;

      if (fullNameInput) {
        fullNameInput.setCustomValidity('');
        fullNameInput.oninvalid = function(e) {
          const target = e.target as HTMLInputElement;
          if (target.validity.valueMissing) {
            target.setCustomValidity('Zəhmət olmasa bu sahəni doldurun');
          }
        };
        fullNameInput.oninput = function(e) {
          (e.target as HTMLInputElement).setCustomValidity('');
        };
      }

      if (emailInput) {
        emailInput.setCustomValidity('');
        emailInput.oninvalid = function(e) {
          const target = e.target as HTMLInputElement;
          if (target.validity.valueMissing) {
            target.setCustomValidity('Zəhmət olmasa bu sahəni doldurun');
          } else if (target.validity.typeMismatch) {
            target.setCustomValidity('Zəhmət olmasa düzgün email ünvanı daxil edin');
          }
        };
        emailInput.oninput = function(e) {
          (e.target as HTMLInputElement).setCustomValidity('');
        };
      }
    };

    setCustomValidationMessages();
    const timer = setTimeout(setCustomValidationMessages, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Yalnız şəkil faylları qəbul edilir');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Şəkil ölçüsü 2MB-dan çox ola bilməz');
      return;
    }

    setImageUploading(true);
    try {
      // Convert to base64 for simple storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        handleChange('profileImage', base64String);
        setImageUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Şəkil yüklənərkən xəta baş verdi');
      setImageUploading(false);
    }
  };

  const removeImage = () => {
    handleChange('profileImage', '');
  };

  const generateAISummary = async () => {
    if (!canUseAI) {
      alert('AI professional summary Premium və Medium istifadəçilər üçün mövcuddur!');
      return;
    }

    if (!cvData || !cvData.personalInfo || !cvData.personalInfo.fullName) {
      alert('AI summary yaratmaq üçün əvvəlcə əsas məlumatları doldurun');
      return;
    }

    setAiGenerating(true);
    try {
      // Token-i düzgün key ilə alaq
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (!token) {
        alert('İcazə xətası. Yenidən giriş edin.');
        return;
      }

      const response = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cvData }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          alert(result.message || 'AI funksiyalar üçün Premium planı lazımdır');
        } else {
          throw new Error(result.error || 'API xətası');
        }
        return;
      }

      if (result.summary) {
        handleChange('summary', result.summary);
        alert('AI professional summary yaradıldı! 🎉');
      }

    } catch (error) {
      console.error('AI Summary error:', error);
      alert('AI summary yaradarkən xəta baş verdi. Yenidən cəhd edin.');
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">👤</span>
        <h2 className="text-xl font-semibold text-gray-900">{getLabel('personalInfo', 'azerbaijani')}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isPremium && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profil Şəkli <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full">Premium</span>
            </label>
            {data.profileImage ? (
              <div className="flex items-center space-x-4">
                <img 
                  src={data.profileImage} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-300 shadow-md"
                />
                <div className="flex flex-col space-y-2">
                  <p className="text-sm text-gray-600">Profil şəkli yükləndi</p>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Şəkli sil
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <span className="text-gray-400 text-xs text-center">Şəkil<br/>yox</span>
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={imageUploading}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer cursor-pointer"
                  />
                  {imageUploading && (
                    <div className="mt-2 flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      <span className="text-sm text-gray-500">Yüklənir...</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG formatında, maksimum 2MB
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {getLabel('fullName', 'azerbaijani')} <span className="text-red-500">*</span>
          </label>
          <input
            id="fullName"
            type="text"
            value={data.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder={getLabel('fullName', 'azerbaijani')}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {getLabel('email', 'azerbaijani')} <span className="text-gray-400 text-xs">({getLabel('optional', 'azerbaijani')})</span>
          </label>
          <input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {getLabel('phone', 'azerbaijani')} <span className="text-gray-400 text-xs">({getLabel('optional', 'azerbaijani')})</span>
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="+994 XX XXX XX XX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {getLabel('website', 'azerbaijani')}
          </label>
          <input
            type="url"
            value={data.website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {getLabel('linkedin', 'azerbaijani')}
          </label>
          <input
            type="url"
            value={data.linkedin || ''}
            onChange={(e) => handleChange('linkedin', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="https://linkedin.com/in/username"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Professional özət
          </label>
          <button
            type="button"
            onClick={generateAISummary}
            disabled={aiGenerating || !canUseAI}
            className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${
              canUseAI
                ? aiGenerating
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:scale-105 shadow-md'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
            title={canUseAI ? 'AI ilə avtomatik professional özət yaradın' : 'AI funksiyalar Premium/Medium üçün mövcuddur'}
          >
            {aiGenerating ? (
              <div className="flex items-center space-x-1">
                <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                <span>AI yaradır...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <span>🤖</span>
                <span>AI Özət</span>
                {!canUseAI && <span className="ml-1">🔒</span>}
              </div>
            )}
          </button>
        </div>
        
        {!canUseAI && (
          <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-purple-600">🤖</span>
              <div>
                <p className="text-sm font-medium text-purple-800">AI Professional Summary</p>
                <p className="text-xs text-purple-600">
                  LinkedIn məlumatlarınızdan avtomatik professional özət yaradın! 
                  <span className="font-semibold"> Premium və Medium </span> istifadəçilər üçün mövcuddur.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <textarea
          value={data.summary || ''}
          onChange={(e) => handleChange('summary', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          placeholder={canUseAI 
            ? "Professional təcrübənizi yazın və ya yuxarıdakı AI butonundan avtomatik yaradın..." 
            : "Professional təcrübənizi və məqsədlərinizi qısaca təsvir edin..."
          }
        />
      </div>
    </div>
  );
}
