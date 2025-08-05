'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

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
        setApiKeys(data.data);
      } else {
        setError('API key-ləri yükləmək mümkün olmadı');
      }
    } catch (err) {
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

      if (response.ok) {
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
      setError('Xəta baş verdi');
    }
  };

  const toggleApiKeyStatus = async (keyId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/sistem/api-keys', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: keyId,
          active: !currentStatus
        })
      });

      if (response.ok) {
        await fetchApiKeys();
      } else {
        setError('Status dəyişdirilə bilmədi');
      }
    } catch (err) {
      setError('Xəta baş verdi');
    }
  };

  const testApiKey = async (keyId: string) => {
    try {
      setTestingKey(keyId);
      const token = localStorage.getItem('adminToken');

      const response = await fetch('/api/sistem/api-keys/test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ apiKeyId: keyId })
      });

      const data = await response.json();

      if (data.success) {
        alert('API key işləyir!');
      } else {
        alert(`API key test uğursuz: ${data.error || 'Naməlum xəta'}`);
      }

      await fetchApiKeys(); // Refresh to show updated lastUsed/lastResult
    } catch (err) {
      alert('Test zamanı xəta baş verdi');
    } finally {
      setTestingKey(null);
    }
  };

  const deleteApiKey = async (keyId: string) => {
    if (!confirm('Bu API key-i silmək istədiyinizə əminsiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/sistem/api-keys?id=${keyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        await fetchApiKeys();
      } else {
        setError('API key silinə bilmədi');
      }
    } catch (err) {
      setError('Xəta baş verdi');
    }
  };

  const getStatusBadge = (active: boolean) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        active 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {active ? 'Aktiv' : 'Deaktiv'}
      </span>
    );
  };

  const getResultBadge = (result: string | null) => {
    if (!result) return <span className="text-gray-400">-</span>;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        result === 'SUCCESS' 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {result === 'SUCCESS' ? 'Uğurlu' : 'Uğursuz'}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">API Key İdarəçiliyi</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Yeni API Key
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Service Filter */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Service:</label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1"
            >
              <option value="all">Hamısı</option>
              {services.map(service => (
                <option key={service.value} value={service.value}>
                  {service.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Add API Key Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Yeni API Key Əlavə Et</h2>
            <form onSubmit={handleAddApiKey} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service
                  </label>
                  <select
                    value={newApiKey.service}
                    onChange={(e) => setNewApiKey({...newApiKey, service: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    {services.map(service => (
                      <option key={service.value} value={service.value}>
                        {service.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioritet
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newApiKey.priority}
                    onChange={(e) => setNewApiKey({...newApiKey, priority: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="text"
                  value={newApiKey.apiKey}
                  onChange={(e) => setNewApiKey({...newApiKey, apiKey: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="API key daxil edin..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Günlük Limit
                </label>
                <input
                  type="number"
                  min="1"
                  value={newApiKey.dailyLimit}
                  onChange={(e) => setNewApiKey({...newApiKey, dailyLimit: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Əlavə Et
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Ləğv Et
                </button>
              </div>
            </form>
          </div>
        )}

        {/* API Keys Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    API Key
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prioritet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İstifadə
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Son Test
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Əməliyyatlar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : apiKeys.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      API key tapılmadı
                    </td>
                  </tr>
                ) : (
                  apiKeys.map((key) => (
                    <tr key={key.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {key.service}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {key.apiKey}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(key.active)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {key.priority}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {key.dailyUsage}/{key.dailyLimit}
                        <div className="text-xs text-gray-500">
                          Ümumi: {key.usageCount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getResultBadge(key.lastResult)}
                        {key.lastUsed && (
                          <div className="text-xs text-gray-500">
                            {new Date(key.lastUsed).toLocaleDateString('az-AZ')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => testApiKey(key.id)}
                          disabled={testingKey === key.id}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                        >
                          {testingKey === key.id ? 'Test...' : 'Test'}
                        </button>
                        <button
                          onClick={() => toggleApiKeyStatus(key.id, key.active)}
                          className={`${
                            key.active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {key.active ? 'Deaktiv et' : 'Aktiv et'}
                        </button>
                        <button
                          onClick={() => deleteApiKey(key.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
