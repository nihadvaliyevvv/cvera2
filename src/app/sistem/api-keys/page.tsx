'use client';

import { useState, useEffect } from 'react';

interface ApiKey {
  id: string;
  service: string;
  apiKey: string;
  active: boolean;
  priority: number;
  usageCount: number;
  lastUsed: string | null;
  lastResult: string | null;
  dailyLimit: number;
  dailyUsage: number;
  lastReset: string;
  createdAt: string;
  updatedAt: string;
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState('all');

  // Add API Key Form State
  const [newApiKey, setNewApiKey] = useState({
    service: 'scrapingdog',
    apiKey: '',
    priority: 1,
    dailyLimit: 1000
  });

  const services = [
    { value: 'scrapingdog', label: 'ScrapingDog' },
    { value: 'rapidapi', label: 'RapidAPI' },
    { value: 'openai', label: 'OpenAI' },
    { value: 'linkedin', label: 'LinkedIn' }
  ];

  useEffect(() => {
    fetchApiKeys();
  }, [selectedService]);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      if (!token) {
        setError('Admin girişi tələb olunur');
        return;
      }

      const url = selectedService === 'all'
        ? '/api/sistem/api-keys'
        : `/api/sistem/api-keys?service=${selectedService}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.data || []);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'API key-ləri yükləmək mümkün olmadı');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleAddApiKey = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newApiKey.apiKey.trim()) {
      setError('API key daxil edin');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/sistem/api-keys', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newApiKey)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await fetchApiKeys();
        setShowAddForm(false);
        setNewApiKey({
          service: 'scrapingdog',
          apiKey: '',
          priority: 1,
          dailyLimit: 1000
        });
        setError('');
      } else {
        setError(data.error || 'API key əlavə edilə bilmədi');
      }
    } catch (err) {
      console.error('Add API key error:', err);
      setError('Xəta baş verdi');
    }
  };

  const testApiKey = async (id: string, service: string, apiKey: string) => {
    setTestingKey(id);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/sistem/api-keys/test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: apiKey,
          service: service
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ API key işləyir!\n${result.message}\nQalan request: ${result.details?.remaining || 'N/A'}`);
      } else {
        alert(`❌ API key test uğursuz:\n${result.error}`);
      }
    } catch (err) {
      console.error('Test error:', err);
      alert('❌ Test zamanı xəta baş verdi');
    } finally {
      setTestingKey(null);
    }
  };

  const toggleApiKeyStatus = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/sistem/api-keys', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: id,
          active: !currentStatus
        })
      });

      if (response.ok) {
        await fetchApiKeys();
      } else {
        setError('Status dəyişdirilə bilmədi');
      }
    } catch (err) {
      console.error('Toggle status error:', err);
      setError('Xəta baş verdi');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 py-5 sm:px-6">
          <h1 className="text-3xl font-bold leading-tight text-gray-900">API Key İdarəetməsi</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Xarici API xidmətləri üçün açarları idarə edin və test edin
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
            <div className="flex space-x-4">
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">Bütün xidmətlər</option>
                {services.map(service => (
                  <option key={service.value} value={service.value}>
                    {service.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              + Yeni API Key Əlavə Et
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-600 text-sm">{error}</div>
        </div>
      )}

      {/* Add API Key Form */}
      {showAddForm && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Yeni API Key Əlavə Et
            </h3>
            <form onSubmit={handleAddApiKey} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Xidmət
                  </label>
                  <select
                    value={newApiKey.service}
                    onChange={(e) => setNewApiKey({ ...newApiKey, service: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    {services.map(service => (
                      <option key={service.value} value={service.value}>
                        {service.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Priority
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newApiKey.priority}
                    onChange={(e) => setNewApiKey({ ...newApiKey, priority: parseInt(e.target.value) })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  API Key
                </label>
                <input
                  type="text"
                  value={newApiKey.apiKey}
                  onChange={(e) => setNewApiKey({ ...newApiKey, apiKey: e.target.value })}
                  placeholder="API key-inizi daxil edin"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Günlük Limit
                </label>
                <input
                  type="number"
                  min="1"
                  value={newApiKey.dailyLimit}
                  onChange={(e) => setNewApiKey({ ...newApiKey, dailyLimit: parseInt(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Əlavə et
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* API Keys List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            API Keys ({apiKeys.length})
          </h3>

          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Hələ API key əlavə edilməyib
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Xidmət
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      API Key
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İstifadə
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Əməliyyatlar
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {apiKeys.map((key) => (
                    <tr key={key.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {key.service}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {key.apiKey ? `${key.apiKey.substring(0, 8)}***${key.apiKey.slice(-4)}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          key.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {key.active ? 'Aktiv' : 'Deaktiv'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {key.priority}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div>{key.usageCount || 0} total</div>
                          <div className="text-xs text-gray-400">
                            {key.dailyUsage || 0}/{key.dailyLimit} günlük
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => testApiKey(key.id, key.service, key.apiKey)}
                          disabled={testingKey === key.id}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                        >
                          {testingKey === key.id ? 'Test edilir...' : 'Test et'}
                        </button>
                        <button
                          onClick={() => toggleApiKeyStatus(key.id, key.active)}
                          className={`${
                            key.active 
                              ? 'text-red-600 hover:text-red-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {key.active ? 'Deaktiv et' : 'Aktiv et'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
