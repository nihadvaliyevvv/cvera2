'use client';

import { useState } from 'react';
import { getLabel } from '@/lib/cvLanguage';

interface Skill {
  id: string;
  name: string;
  level?: string;
}

interface SkillsSectionProps {
  data: Skill[];
  onChange: (data: Skill[]) => void;
  userTier?: string; // User tier for AI features
  cvData?: any; // Full CV data for AI analysis
  cvId?: string; // CV ID for AI suggestions
}

interface SkillSuggestion {
  name: string;
  reason: string;
  category?: string; // Add optional category property
  relevanceScore?: number; // Relevance score (1-10)
  marketDemand?: string; // Market demand level
  implementation?: string; // How to develop this skill
  timeToMaster?: string; // Time needed to master
  industryTrend?: string; // Industry trend information
}

export default function SkillsSection({ data, onChange, userTier = 'Free', cvData, cvId }: SkillsSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<SkillSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const canUseAI = userTier === 'Premium' || userTier === 'Medium';

  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: ''
    };
    onChange([...data, newSkill]);
    setExpandedId(newSkill.id);
  };

  const updateSkill = (id: string, field: keyof Skill, value: string) => {
    const updated = data.map(skill => 
      skill.id === id ? { ...skill, [field]: value } : skill
    );
    onChange(updated);
  };

  const removeSkill = (id: string) => {
    onChange(data.filter(skill => skill.id !== id));
  };

  const moveSkill = (id: string, direction: 'up' | 'down') => {
    const index = data.findIndex(skill => skill.id === id);
    if (direction === 'up' && index > 0) {
      const updated = [...data];
      [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
      onChange(updated);
    } else if (direction === 'down' && index < data.length - 1) {
      const updated = [...data];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      onChange(updated);
    }
  };

  const getSuggestionsFromAI = async () => {
    if (!canUseAI) {
      alert(`AI bacarıq tövsiyələri Premium və Medium istifadəçilər üçün mövcuddur! Sizin tier: ${userTier}`);
      return;
    }

    if (!cvId) {
      alert('AI tövsiyələri almaq üçün CV ID lazımdır');
      return;
    }

    // Check if user has enough data for meaningful suggestions
    const hasExperience = cvData?.experience && cvData.experience.length > 0;
    const hasEducation = cvData?.education && cvData.education.length > 0;
    const hasPersonalInfo = cvData?.personalInfo && cvData.personalInfo.fullName;

    if (!hasPersonalInfo || (!hasExperience && !hasEducation)) {
      alert('AI tövsiyələri üçün əvvəlcə təcrübə və ya təhsil məlumatlarını doldurun');
      return;
    }

    setAiSuggesting(true);
    setShowSuggestions(false);
    console.log('🤖 Getting AI skill suggestions...');

    try {
      // Get authentication token
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token') || localStorage.getItem('auth-token');

      if (!token) {
        alert('Giriş icazəsi yoxdur. Yenidən giriş edin.');
        setAiSuggesting(false);
        return;
      }

      const response = await fetch('/api/ai/suggest-skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ cvId }),
      });

      console.log('📡 AI Skills API Response:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      const result = await response.json();
      console.log('📋 AI Skills Result:', result);

      if (!response.ok) {
        if (response.status === 401) {
          alert('Giriş icazəsi yoxdur. Yenidən giriş edin.');
        } else if (response.status === 403) {
          alert(result.error || 'AI funksiyalar üçün Premium/Medium planı lazımdır');
        } else {
          throw new Error(result.error || 'API xətası');
        }
        return;
      }

      if (result.success && result.suggestions && result.suggestions.length > 0) {
        console.log('✅ AI Skills suggestions received:', result.suggestions.length, 'suggestions');
        setSuggestions(result.suggestions);
        setShowSuggestions(true);
      } else {
        console.log('❌ No suggestions received from API');
        throw new Error('AI tövsiyələr alına bilmədi');
      }

    } catch (error) {
      console.error('💥 AI Skills suggestion error:', error);
      alert('AI tövsiyələr alarkən xəta baş verdi. Yenidən cəhd edin.');
    } finally {
      setAiSuggesting(false);
    }
  };

  const addSuggestedSkill = (suggestion: SkillSuggestion) => {
    // Check if skill already exists
    const existingSkill = data.find(skill =>
      skill.name.toLowerCase() === suggestion.name.toLowerCase()
    );

    if (existingSkill) {
      alert('Bu bacarıq artıq mövcuddur!');
      return;
    }

    // Add the suggested skill
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: suggestion.name
    };

    onChange([...data, newSkill]);

    // Remove the suggestion from the list
    setSuggestions(prev => prev.filter(s => s.name !== suggestion.name));

    // Show success message
    alert(`"${suggestion.name}" bacarığı CV-nizə əlavə edildi! 🎉`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-900">Bacarıqlar</h2>
        </div>
        <button
          onClick={addSkill}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Bacarıq əlavə et
        </button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Hələ heç bir bacarıq əlavə edilməyib.</p>
          <p className="text-sm mt-2">Başlamaq üçün "Bacarıq əlavə et" düyməsini basın.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((skill, index) => (
            <div key={skill.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                  <span className="text-sm text-gray-900 font-medium">{skill.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => moveSkill(skill.id, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveSkill(skill.id, 'down')}
                    disabled={index === data.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => setExpandedId(expandedId === skill.id ? null : skill.id)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                  >
                    {expandedId === skill.id ? '▼' : '▶'}
                  </button>
                  <button
                    onClick={() => removeSkill(skill.id)}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {expandedId === skill.id && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bacarıq adı <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={skill.name}
                        onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="JavaScript, Photoshop, Project Management, və s."
                      />
                    </div>
                  </div>


                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {data.length > 0 && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bacarıqlar</h3>
          <p className="text-sm text-gray-700">
            Bacarıqlarınızı kateqoriyalara ayırın (məsələn: &quot;Proqramlaşdırma&quot;, &quot;Dizayn&quot;, &quot;İdarəetmə&quot;) 
            və ən vacib bacarıqlarınızı yuxarıda yerləşdirin.
          </p>
        </div>
      )}

      {/* AI Skills Suggestions Section - Enhanced */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🤖</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Professional Skills Analyzer</h3>
              <p className="text-sm text-gray-600">
                {canUseAI ?
                  `${userTier} üzvü - Professional skills analizi və tövsiyələri` :
                  'Premium və Medium üzvlər üçün mövcuddur'
                }
              </p>
            </div>
          </div>

          {canUseAI && (
            <div className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
              ✨ AI Powered
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="text-sm text-gray-700">
            <p className="mb-2">
              <strong>AI sizin profilinizi analiz edəcək:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 ml-2">
              <li>İş təcrübəniz və karyera inkişafınız</li>
              <li>Təhsil fonu və sertifikatlarınız</li>
              <li>Mövcud bacarıqlar və expertiza sahələri</li>
              <li>İndustiya trendləri və market tələbləri</li>
              <li>Karyera məqsədləriniz üçün strateji skills</li>
            </ul>
          </div>

          <button
            onClick={getSuggestionsFromAI}
            disabled={!canUseAI || aiSuggesting}
            className={`w-full px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              !canUseAI 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : aiSuggesting
                ? 'bg-purple-300 text-purple-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
          >
            {aiSuggesting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                <span>AI profilinizi analiz edir...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>🎯</span>
                <span>Professional Skills Tövsiyələri Al</span>
              </div>
            )}
          </button>

          {!canUseAI && (
            <div className="p-4 bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-purple-600 text-lg">💎</span>
                <div>
                  <p className="text-sm font-medium text-purple-800 mb-1">
                    AI Professional Skills Analyzer
                  </p>
                  <p className="text-xs text-purple-700">
                    CV məlumatlarınızı dərin analiz edərək karyeranız üçün ən münasib
                    professional skills tövsiyələri verir. Premium və Medium planlar üçün mövcuddur.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* AI Suggestions Display - Enhanced */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-gray-900">
                  🎯 AI Professional Tövsiyələri
                </h4>
                <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                  {suggestions.length} təklif
                </span>
              </div>

              {suggestions.map((suggestion, index) => (
                <div key={index} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                  {/* Skill Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="text-base font-semibold text-gray-900">
                          {suggestion.name}
                        </h5>
                        {suggestion.category && (
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            suggestion.category === 'Strategic' ? 'bg-purple-100 text-purple-700' :
                            suggestion.category === 'Technical' ? 'bg-blue-100 text-blue-700' :
                            suggestion.category === 'Leadership' ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {suggestion.category}
                          </span>
                        )}
                      </div>

                      {/* Skill Metrics */}
                      <div className="flex items-center gap-4 mb-2">
                        {suggestion.relevanceScore && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">Uyğunluq:</span>
                            <div className="flex">
                              {[...Array(10)].map((_, i) => (
                                <span key={i} className={`text-xs ${
                                  i < (suggestion.relevanceScore || 0) ? 'text-yellow-400' : 'text-gray-300'
                                }`}>
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-xs text-gray-600">
                              {suggestion.relevanceScore}/10
                            </span>
                          </div>
                        )}

                        {suggestion.marketDemand && (
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            suggestion.marketDemand === 'Critical' ? 'bg-red-100 text-red-700' :
                            suggestion.marketDemand === 'Very High' ? 'bg-orange-100 text-orange-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            📈 {suggestion.marketDemand}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Skill Description */}
                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                    {suggestion.reason}
                  </p>

                  {/* Additional Info */}
                  {(suggestion.implementation || suggestion.timeToMaster || suggestion.industryTrend) && (
                    <div className="bg-gray-50 p-3 rounded-lg mb-3 space-y-2">
                      {suggestion.implementation && (
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-gray-500 font-medium min-w-fit">💡 Necə inkişaf etdirin:</span>
                          <span className="text-xs text-gray-700">{suggestion.implementation}</span>
                        </div>
                      )}

                      {suggestion.timeToMaster && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 font-medium">⏱️ Mənimsəmə müddəti:</span>
                          <span className="text-xs text-gray-700">{suggestion.timeToMaster}</span>
                        </div>
                      )}

                      {suggestion.industryTrend && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 font-medium">📊 İndustiya trendi:</span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            suggestion.industryTrend === 'Future-Critical' ? 'bg-purple-100 text-purple-700' :
                            suggestion.industryTrend === 'Essential' ? 'bg-red-100 text-red-700' :
                            suggestion.industryTrend === 'Growing' ? 'bg-green-100 text-green-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {suggestion.industryTrend}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => addSuggestedSkill(suggestion)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    ✨ CV-yə əlavə et
                  </button>
                </div>
              ))}

              {/* Regenerate Button */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={getSuggestionsFromAI}
                  disabled={aiSuggesting}
                  className="w-full px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium"
                >
                  🔄 Yeni tövsiyələr al
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Hər dəfə fərqli professional skills tövsiyələri alacaqsınız
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
