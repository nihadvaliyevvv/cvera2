import React, { useState, useEffect } from 'react';
import { useLinkedInImport } from '@/hooks/useLinkedInImport';

interface LinkedInImportComponentProps {
  onImportSuccess?: (cvId: string) => void;
  className?: string;
}

export function LinkedInImportComponent({ onImportSuccess, className = '' }: LinkedInImportComponentProps) {
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [importResult, setImportResult] = useState<any>(null);
  const { importProfile, checkLimits, isLoading, error, limits } = useLinkedInImport();

  useEffect(() => {
    // Check limits when component mounts
    checkLimits();
  }, [checkLimits]);

  const handleImport = async () => {
    if (!linkedinUrl.trim()) {
      return;
    }

    const result = await importProfile(linkedinUrl);
    setImportResult(result);

    if (result.success && result.cvId && onImportSuccess) {
      onImportSuccess(result.cvId);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLinkedinUrl(e.target.value);
    setImportResult(null); // Clear previous results
  };

  const getRemainingImportsText = () => {
    if (!limits) return '';
    if (limits.userTier === 'Premium') return 'Unlimited imports';
    return `${limits.remainingImports} imports remaining today`;
  };

  const getPlanLimitText = () => {
    if (!limits) return '';
    if (limits.userTier === 'Premium') return 'Premium: Unlimited LinkedIn imports';
    return `${limits.userTier}: ${limits.limits[limits.userTier as keyof typeof limits.limits]} imports per day`;
  };

  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <h2 className="card-title">
          <svg className="icon" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          LinkedIn Import
        </h2>
        <p className="card-description">
          Import your LinkedIn profile to automatically create a CV
        </p>
      </div>
      <div className="card-content">
        {/* Plan limits info */}
        {limits && (
          <div className="alert alert-info">
            <div className="alert-icon">
              <svg className="icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12C24 5.373 18.627 0 12 0zm1 17.938V18H11v-1.062C6.677 16.348 3.652 13.323 3.062 9H2V7h1.062C3.652 3.677 6.677.652 11 .062V0h2v1.062C18.323.652 21.348 3.677 21.938 7H22v2h-1.062c-.59 4.323-3.615 7.348-8.062 7.938z"/>
              </svg>
            </div>
            <div className="alert-content">
              <span className="font-medium">{getPlanLimitText()}</span>
              <div className="text-sm">
                {getRemainingImportsText()}
              </div>
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="alert alert-error">
            <div className="alert-icon">
              <svg className="icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12C24 5.373 18.627 0 12 0zm1 17.938V18H11v-1.062C6.677 16.348 3.652 13.323 3.062 9H2V7h1.062C3.652 3.677 6.677.652 11 .062V0h2v1.062C18.323.652 21.348 3.677 21.938 7H22v2h-1.062c-.59 4.323-3.615 7.348-8.062 7.938z"/>
              </svg>
            </div>
            <div className="alert-content">
              {error}
            </div>
          </div>
        )}

        {/* Success display */}
        {importResult?.success && (
          <div className="alert alert-success">
            <div className="alert-icon">
              <svg className="icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12C24 5.373 18.627 0 12 0zm1 17.938V18H11v-1.062C6.677 16.348 3.652 13.323 3.062 9H2V7h1.062C3.652 3.677 6.677.652 11 .062V0h2v1.062C18.323.652 21.348 3.677 21.938 7H22v2h-1.062c-.59 4.323-3.615 7.348-8.062 7.938z"/>
              </svg>
            </div>
            <div className="alert-content">
              Successfully imported LinkedIn profile for {importResult.profile?.name}!
              {importResult.remainingImports !== undefined && (
                <span className="block text-sm">
                  {importResult.remainingImports === -1
                    ? 'Unlimited imports remaining'
                    : `${importResult.remainingImports} imports remaining today`}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Input and import button */}
        <div className="space-y-3">
          <div>
            <label htmlFor="linkedin-url" className="block text-sm font-medium text-gray-700 mb-1">
              LinkedIn Profile URL or Username
            </label>
            <input
              id="linkedin-url"
              type="text"
              placeholder="https://linkedin.com/in/username or just username"
              value={linkedinUrl}
              onChange={handleInputChange}
              disabled={isLoading || (limits?.canImport === false)}
              className="input w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              You can paste the full LinkedIn URL or just the username
            </p>
          </div>

          <button
            onClick={handleImport}
            disabled={!linkedinUrl.trim() || isLoading || (limits?.canImport === false)}
            className="btn w-full"
          >
            {isLoading ? (
              <>
                <svg className="icon mr-2 animate-spin" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12C24 5.373 18.627 0 12 0zm1 17.938V18H11v-1.062C6.677 16.348 3.652 13.323 3.062 9H2V7h1.062C3.652 3.677 6.677.652 11 .062V0h2v1.062C18.323.652 21.348 3.677 21.938 7H22v2h-1.062c-.59 4.323-3.615 7.348-8.062 7.938z"/>
                </svg>
                Importing LinkedIn Profile...
              </>
            ) : limits?.canImport === false ? (
              'Daily Import Limit Reached'
            ) : (
              'Import LinkedIn Profile'
            )}
          </button>
        </div>

        {/* Upgrade notice for free users */}
        {limits && limits.userTier === 'Free' && limits.remainingImports <= 1 && (
          <div className="alert alert-warning">
            <div className="alert-content">
              <strong>Almost at your limit!</strong> Upgrade to Medium (5 imports/day) or Premium (unlimited) for more LinkedIn imports.
            </div>
          </div>
        )}

        {/* Import result details */}
        {importResult?.success && importResult.profile && (
          <div className="alert alert-success">
            <h4 className="font-medium text-green-800 mb-2">Import Successful!</h4>
            <div className="text-sm text-green-700 space-y-1">
              <p><strong>Name:</strong> {importResult.profile.name}</p>
              {importResult.profile.headline && (
                <p><strong>Headline:</strong> {importResult.profile.headline}</p>
              )}
              {importResult.profile.location && (
                <p><strong>Location:</strong> {importResult.profile.location}</p>
              )}
              {(importResult.profile.experienceCount || importResult.profile.educationCount || importResult.profile.skillsCount) && (
                <div className="flex gap-4 mt-2 text-xs">
                  {importResult.profile.experienceCount && (
                    <span>{importResult.profile.experienceCount} work experiences</span>
                  )}
                  {importResult.profile.educationCount && (
                    <span>{importResult.profile.educationCount} education entries</span>
                  )}
                  {importResult.profile.skillsCount && (
                    <span>{importResult.profile.skillsCount} skills</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
