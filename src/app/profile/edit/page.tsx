'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  tier: string;
  loginMethod: string;
  linkedinUsername?: string;
  createdAt: string;
  lastLogin?: string;
}

export default function ProfileEditPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const router = useRouter();

  // Load user profile - wrapped in useCallback to fix dependency issue
  const loadProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setFormData({
          name: data.user.name,
          email: data.user.email,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setError('Profil məlumatları yüklənərkən xəta baş verdi');
      }
    } catch (error) {
      setError('Sistem xətası baş verdi');
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Load user profile
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    // Validate password fields if changing password
    if (showPasswordSection) {
      if (!formData.currentPassword) {
        setError('Hazırki şifrə tələb olunur');
        setSaving(false);
        return;
      }
      if (!formData.newPassword) {
        setError('Yeni şifrə tələb olunur');
        setSaving(false);
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError('Yeni şifrələr uyğun gəlmir');
        setSaving(false);
        return;
      }
      if (formData.newPassword.length < 8) {
        setError('Yeni şifrə ən azı 8 simvoldan ibarət olmalıdır');
        setSaving(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      const updateData: any = {
        name: formData.name,
        email: formData.email
      };

      // Add password fields if changing password
      if (showPasswordSection) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Profil uğurla yeniləndi');
        setProfile(data.user);
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordSection(false);
      } else {
        setError(data.message || 'Profil yenilənərkən xəta baş verdi');
      }
    } catch (error) {
      setError('Sistem xətası baş verdi');
    } finally {
      setSaving(false);
    }
  };

  const getTierBadge = (tier: string) => {
    const tierColors = {
      'Free': 'bg-gray-100 text-gray-800',
      'Medium': 'bg-blue-100 text-blue-800',
      'Premium': 'bg-purple-100 text-purple-800'
    };
    return tierColors[tier as keyof typeof tierColors] || 'bg-gray-100 text-gray-800';
  };

  const getTierName = (tier: string) => {
    const tierNames = {
      'Free': 'Pulsuz',
      'Medium': 'Orta',
      'Premium': 'Premium'
    };
    return tierNames[tier as keyof typeof tierNames] || tier;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Dashboard-a qayıt
              </Link>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Profil Redaktəsi</h1>
            <div></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">{profile?.name}</h2>
                <p className="text-blue-100">{profile?.email}</p>
                <div className="flex items-center space-x-3 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTierBadge(profile?.tier || 'Free')}`}>
                    {getTierName(profile?.tier || 'Free')}
                  </span>
                  {profile?.loginMethod === 'linkedin' && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      LinkedIn hesabı
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="p-6">
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-400 text-green-700 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {success}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Ad və Soyad
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Adınız və soyadınız"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Account Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Hesab Məlumatları</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paket
                    </label>
                    <div className={`inline-flex px-4 py-2 rounded-lg text-sm font-medium ${getTierBadge(profile?.tier || 'Free')}`}>
                      {getTierName(profile?.tier || 'Free')}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giriş Metodu
                    </label>
                    <div className="flex items-center space-x-2">
                      {profile?.loginMethod === 'linkedin' ? (
                        <>
                          <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                          <span className="text-sm text-gray-600">LinkedIn</span>
                          {profile?.linkedinUsername && (
                            <span className="text-sm text-gray-400">(@{profile.linkedinUsername})</span>
                          )}
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                          <span className="text-sm text-gray-600">Email və Şifrə</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Section - Only for email users */}
              {profile?.loginMethod !== 'linkedin' && (
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Şifrə Dəyişikliyi</h3>
                    <button
                      type="button"
                      onClick={() => setShowPasswordSection(!showPasswordSection)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      {showPasswordSection ? 'Ləğv et' : 'Şifrəni dəyiş'}
                    </button>
                  </div>

                  {showPasswordSection && (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          Hazırki Şifrə
                        </label>
                        <input
                          id="currentPassword"
                          type="password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          placeholder="Hazırki şifrənizi daxil edin"
                          value={formData.currentPassword}
                          onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Yeni Şifrə
                          </label>
                          <input
                            id="newPassword"
                            type="password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="Yeni şifrənizi daxil edin"
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                          />
                        </div>

                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Şifrəni Təsdiq Edin
                          </label>
                          <input
                            id="confirmPassword"
                            type="password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="Yeni şifrənizi təkrar edin"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Account Statistics */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Hesab Statistikaları</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{(profile as any)?.cvCount || 0}</div>
                    <div className="text-sm text-gray-600">Yaradılmış CV-lər</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('az-AZ') : '—'}
                    </div>
                    <div className="text-sm text-gray-600">Qeydiyyat tarixi</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {profile?.lastLogin ? new Date(profile.lastLogin).toLocaleDateString('az-AZ') : '—'}
                    </div>
                    <div className="text-sm text-gray-600">Son giriş</div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end space-x-4 pt-6">
                <Link
                  href="/dashboard"
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Ləğv et
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Yadda saxlanılır...
                    </>
                  ) : (
                    'Dəyişiklikləri Yadda Saxla'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
