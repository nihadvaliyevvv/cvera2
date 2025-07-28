'use client';

import Link from 'next/link';
import SocialShare from './SocialShare';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo və məlumat */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">CV</span>
              </div>
              <span className="text-2xl font-bold text-white">CVera</span>
            </Link>
            <p className="text-gray-300 mb-6 max-w-md">
              AI ilə CV yaratmaq artıq daha asan! Peşəkar CV-lər yaradın və karyera yolunuzda uğurla irəliləyin.
            </p>

            {/* Sosial Media Paylaşımı */}
            <div className="mb-6">
              <SocialShare
                url="https://cvera.net"
                title="CVERA - AI ilə CV Yaratmaq Platforması"
                description="Peşəkar CV yaradın və LinkedIn məlumatlarınızı import edin"
                className="flex-wrap"
              />
            </div>
          </div>

          {/* Xidmətlər */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Xidmətlər</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/cv/create" className="text-gray-300 hover:text-white transition-colors">
                  CV Yaratmaq
                </Link>
              </li>
              <li>
                <Link href="/templates" className="text-gray-300 hover:text-white transition-colors">
                  CV Şablonları
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">
                  Qiymətləndirilmə
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Şirkət */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Şirkət</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">
                  İstifadə Şərtləri
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">
                  Məxfilik Siyasəti
                </Link>
              </li>
              <li>
                <a href="mailto:support@cvera.net" className="text-gray-300 hover:text-white transition-colors">
                  Dəstək
                </a>
              </li>
              <li>
                <a href="mailto:info@cvera.net" className="text-gray-300 hover:text-white transition-colors">
                  Əlaqə
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Rəsmi Sosial Media Linklər */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <span className="text-gray-300 text-sm">Bizi izləyin:</span>

              {/* LinkedIn Rəsmi */}
              <a
                href="https://www.linkedin.com/company/cvera-net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-blue-400 transition-colors"
                title="LinkedIn-də izləyin"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>

              {/* Facebook Rəsmi */}
              <a
                href="https://www.facebook.com/cvera.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-blue-600 transition-colors"
                title="Facebook-da izləyin"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* Instagram Rəsmi */}
              <a
                href="https://www.instagram.com/cvera.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-pink-400 transition-colors"
                title="Instagram-da izləyin"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C8.396 0 7.989.013 7.041.048 4.928.097 3.105 1.92 3.056 4.032.013 7.989 0 8.396 0 12.017c0 3.624.013 4.09.048 5.014.097 2.112 1.92 3.935 4.032 3.984C7.989 23.987 8.396 24 12.017 24c3.624 0 4.09-.013 5.014-.048 2.112-.097 3.935-1.92 3.984-4.032C23.987 16.011 24 15.604 24 12.017c0-3.624-.013-4.09-.048-5.014C23.905 4.928 22.082 3.105 19.97 3.056 16.011.013 15.604 0 12.017 0zm0 2.171c3.556 0 3.98.015 5.382.087 1.3.06 2.006.276 2.476.458.622.242 1.067.532 1.534.999.466.466.756.911.998 1.534.182.47.398 1.176.458 2.476.072 1.402.087 1.826.087 5.382 0 3.556-.015 3.98-.087 5.382-.06 1.3-.276 2.006-.458 2.476-.242.622-.532 1.067-.999 1.534-.466.466-.911.756-1.534.998-.47.182-1.176.398-2.476.458-1.402.072-1.826.087-5.382.087-3.556 0-3.98-.015-5.382-.087-1.3-.06-2.006-.276-2.476-.458-.622-.242-1.067-.532-1.534-.999-.466-.466-.756-.911-.998-1.534-.182-.47-.398-1.176-.458-2.476-.072-1.402-.087-1.826-.087-5.382 0-3.556.015-3.98.087-5.382.06-1.3.276-2.006.458-2.476.242-.622.532-1.067.999-1.534.466-.466.911-.756 1.534-.998.47-.182 1.176-.398 2.476-.458 1.402-.072 1.826-.087 5.382-.087z"/>
                  <path d="M12.017 5.838A6.179 6.179 0 1 0 18.196 12.017 6.179 6.179 0 0 0 12.017 5.838zm0 10.188a4.009 4.009 0 1 1 4.009-4.009 4.009 4.009 0 0 1-4.009 4.009z"/>
                  <circle cx="18.406" cy="5.594" r="1.44"/>
                </svg>
              </a>

              {/* Twitter/X Rəsmi */}
              <a
                href="https://twitter.com/cvera_net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-blue-400 transition-colors"
                title="Twitter-də izləyin"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>

            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm">
                © {currentYear} CVera.net. Bütün hüquqlar qorunur.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                AI ilə powered CV yaratmaq platforması
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
