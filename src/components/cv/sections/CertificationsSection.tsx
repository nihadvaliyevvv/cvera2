'use client';

import { useState } from 'react';

interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

interface CertificationsSectionProps {
  data: Certification[];
  onChange: (data: Certification[]) => void;
}

export default function CertificationsSection({ data, onChange }: CertificationsSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addCertification = () => {
    const newCertification: Certification = {
      id: Date.now().toString(),
      name: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      url: ''
    };
    onChange([...data, newCertification]);
    setExpandedId(newCertification.id);
  };

  const updateCertification = (id: string, field: keyof Certification, value: string) => {
    const updated = data.map(cert => 
      cert.id === id ? { ...cert, [field]: value } : cert
    );
    onChange(updated);
  };

  const removeCertification = (id: string) => {
    onChange(data.filter(cert => cert.id !== id));
  };

  const moveCertification = (id: string, direction: 'up' | 'down') => {
    const index = data.findIndex(cert => cert.id === id);
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

  const isExpired = (expiryDate: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString + '-01');
    return date.toLocaleDateString('az-AZ', { year: 'numeric', month: 'long' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <h2 className="text-xl font-semibold text-gray-900">Sertifikatlar</h2>
        </div>
        <button
          onClick={addCertification}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Sertifikat əlavə et
        </button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Hələ heç bir sertifikat əlavə edilməyib.</p>
          <p className="text-sm mt-2">Başlamaq üçün "Sertifikat əlavə et" düyməsini basın.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((certification, index) => (
            <div key={certification.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                  <span className="text-sm text-gray-900 font-medium">{certification.name}</span>
                  {certification.name && certification.issuer && (
                    <span className="text-xs text-gray-500">- {certification.issuer}</span>
                  )}
                  {certification.expiryDate && isExpired(certification.expiryDate) && (
                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                      Müddəti keçib
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => moveCertification(certification.id, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveCertification(certification.id, 'down')}
                    disabled={index === data.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => setExpandedId(expandedId === certification.id ? null : certification.id)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                  >
                    {expandedId === certification.id ? '▼' : '▶'}
                  </button>
                  <button
                    onClick={() => removeCertification(certification.id)}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {expandedId === certification.id && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sertifikat adı <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={certification.name}
                        onChange={(e) => updateCertification(certification.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="AWS Cloud Practitioner, PMP, və s."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Verən təşkilat <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={certification.issuer}
                        onChange={(e) => updateCertification(certification.id, 'issuer', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Amazon Web Services, PMI, Microsoft, və s."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Verilmə tarixi <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="month"
                        value={certification.issueDate}
                        onChange={(e) => updateCertification(certification.id, 'issueDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bitirmə tarixi
                      </label>
                      <input
                        type="month"
                        value={certification.expiryDate || ''}
                        onChange={(e) => updateCertification(certification.id, 'expiryDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Müddəti yoxdursa, boş buraxın
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sertifikat ID
                      </label>
                      <input
                        type="text"
                        value={certification.credentialId || ''}
                        onChange={(e) => updateCertification(certification.id, 'credentialId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="ABC123456789"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sertifikat URL-i
                      </label>
                      <input
                        type="url"
                        value={certification.url || ''}
                        onChange={(e) => updateCertification(certification.id, 'url', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="https://www.credly.com/badges/..."
                      />
                    </div>
                  </div>

                  {certification.issueDate && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>📅</span>
                        <span>
                          {formatDate(certification.issueDate)}
                          {certification.expiryDate && (
                            <>
                              {' - '}
                              <span className={isExpired(certification.expiryDate) ? 'text-red-600' : ''}>
                                {formatDate(certification.expiryDate)}
                              </span>
                              {isExpired(certification.expiryDate) && (
                                <span className="text-red-600"> (Müddəti keçib)</span>
                              )}
                            </>
                          )}
                        </span>
                      </div>
                      {certification.credentialId && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <span>🆔</span>
                          <span>ID: {certification.credentialId}</span>
                        </div>
                      )}
                      {certification.url && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <span>🔗</span>
                          <a 
                            href={certification.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            Sertifikatı görüntülə
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {data.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">💡 Məsləhət:</h4>
          <p className="text-sm text-blue-800">
            Sertifikatlarınızı əhəmiyyət sırasına görə düzün. Aktual olan və iş üçün vacib olanları 
            yuxarıda yerləşdirin. Sertifikat linkləri və ID-ləri əlavə etməyi unutmayın.
          </p>
        </div>
      )}
    </div>
  );
}
