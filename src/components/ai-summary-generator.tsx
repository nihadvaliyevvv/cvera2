'use client';

import { useState } from 'react';
import { useNotification } from '@/components/ui/Toast';

interface AISummaryGeneratorProps {
  cvId: string;
  currentSummary?: string;
  userTier: 'Free' | 'Medium' | 'Premium';
  onSummaryGenerated?: (summary: string) => void;
}

export function AISummaryGenerator({
  cvId,
  currentSummary,
  userTier,
  onSummaryGenerated
}: AISummaryGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<string>('');
  const { showSuccess, showError, showWarning } = useNotification();

  const canUseAI = userTier === 'Medium' || userTier === 'Premium';

  const handleGenerateAISummary = async () => {
    if (!canUseAI) {
      showWarning('AI summary generation is only available for Medium and Premium subscribers');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/ai/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ cvId })
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedSummary(data.summary);
        onSummaryGenerated?.(data.summary);
        showSuccess('AI summary generated successfully!');
      } else {
        showError(data.error || 'Failed to generate AI summary');
      }
    } catch (error) {
      console.error('AI summary generation error:', error);
      showError('An error occurred while generating the AI summary');
    } finally {
      setIsGenerating(false);
    }
  };

  const getSummaryFeatures = () => {
    if (userTier === 'Premium') {
      return [
        'Executive-level professional summary (120-180 words)',
        'Leadership and strategic thinking focus',
        'Advanced ATS optimization with industry keywords',
        'Quantifiable achievements highlighting',
        'Multi-cultural and international experience integration',
        'C-level positioning and decision-maker language'
      ];
    } else if (userTier === 'Medium') {
      return [
        'Professional summary optimized for ATS (80-120 words)',
        'Key technical skills integration',
        'Industry expertise highlighting',
        'Professional achievements focus',
        'Action verbs and engaging language'
      ];
    } else {
      return [
        'Upgrade to Medium or Premium to unlock AI summary generation',
        'Professional ATS-optimized summaries',
        'Industry-specific keyword optimization',
        'Personalized based on your experience and skills'
      ];
    }
  };

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-blue-600">✨</span>
            <h3 className="text-lg font-semibold text-gray-900">AI Professional Summary Generator</h3>
            {userTier === 'Premium' && (
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                👑 Premium
              </span>
            )}
            {userTier === 'Medium' && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                Medium
              </span>
            )}
          </div>
          {canUseAI && (
            <button
              onClick={handleGenerateAISummary}
              disabled={isGenerating}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isGenerating
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg'
              }`}
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>✨</span>
                  <span>Generate AI Summary</span>
                </div>
              )}
            </button>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {canUseAI
            ? `Create a ${userTier.toLowerCase()}-level professional summary using AI based on your CV data`
            : 'Upgrade your plan to access AI-powered professional summary generation'
          }
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Features List */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700">
            {canUseAI ? 'Features included:' : 'Available with upgrade:'}
          </h4>
          <ul className="space-y-1">
            {getSummaryFeatures().map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                {canUseAI ? (
                  <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                ) : (
                  <span className="text-orange-500 mt-0.5 flex-shrink-0">⚠</span>
                )}
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Current Summary Display */}
        {currentSummary && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Current Summary:</h4>
            <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 border-l-4 border-gray-300">
              {currentSummary}
            </div>
          </div>
        )}

        {/* Generated Summary Display */}
        {generatedSummary && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">AI-Generated Summary:</h4>
            <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg text-sm text-gray-700 border-l-4 border-blue-500">
              {generatedSummary}
            </div>
            <p className="text-xs text-gray-500">
              This summary has been automatically applied to your CV and optimized for ATS compatibility.
            </p>
          </div>
        )}

        {/* Upgrade CTA for Free Users */}
        {!canUseAI && (
          <div className="text-center space-y-3 pt-4 border-t">
            <p className="text-sm text-gray-600">
              Unlock AI-powered professional summaries with our Medium or Premium plans
            </p>
            <div className="flex gap-2 justify-center">
              <a
                href="/pricing"
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                View Plans
              </a>
              <a
                href="/pricing"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-colors"
              >
                Upgrade Now
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
