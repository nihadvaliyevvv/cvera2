'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { validateEmail, validatePassword, validateName } from '@/lib/validation';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin: () => void;
}

const RegisterForm = ({ onSuccess, onSwitchToLogin }: RegisterFormProps) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Form validasiya mesajlarını Azərbaycan dilinə çevirmək
  useEffect(() => {
    const setCustomValidationMessages = () => {
      const nameInput = document.getElementById('name') as HTMLInputElement;
      const emailInput = document.getElementById('email') as HTMLInputElement;
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement;

      if (nameInput) {
        nameInput.setCustomValidity('');
        nameInput.oninvalid = function(e) {
          const target = e.target as HTMLInputElement;
          if (target.validity.valueMissing) {
            target.setCustomValidity('Zəhmət olmasa bu sahəni doldurun');
          }
        };
        nameInput.oninput = function(e) {
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

      if (passwordInput) {
        passwordInput.setCustomValidity('');
        passwordInput.oninvalid = function(e) {
          const target = e.target as HTMLInputElement;
          if (target.validity.valueMissing) {
            target.setCustomValidity('Zəhmət olmasa bu sahəni doldurun');
          } else if (target.validity.tooShort) {
            target.setCustomValidity('Şifrə ən azı 8 simvoldan ibarət olmalıdır');
          }
        };
        passwordInput.oninput = function(e) {
          (e.target as HTMLInputElement).setCustomValidity('');
        };
      }

      if (confirmPasswordInput) {
        confirmPasswordInput.setCustomValidity('');
        confirmPasswordInput.oninvalid = function(e) {
          const target = e.target as HTMLInputElement;
          if (target.validity.valueMissing) {
            target.setCustomValidity('Zəhmət olmasa bu sahəni doldurun');
          }
        };
        confirmPasswordInput.oninput = function(e) {
          (e.target as HTMLInputElement).setCustomValidity('');
        };
      }
    };

    setCustomValidationMessages();
    const timer = setTimeout(setCustomValidationMessages, 50);
    return () => clearTimeout(timer);
  }, []);

  // Real-time validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setFormData(prev => ({ ...prev, email }));

    // Clear previous error
    setFieldErrors(prev => ({ ...prev, email: '' }));

    // Validate email if not empty
    if (email.trim()) {
      const validation = validateEmail(email);
      if (!validation.isValid) {
        setFieldErrors(prev => ({ ...prev, email: validation.error! }));
      }
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({ ...prev, name }));

    // Clear previous error
    setFieldErrors(prev => ({ ...prev, name: '' }));

    // Validate name if not empty
    if (name.trim()) {
      const validation = validateName(name);
      if (!validation.isValid) {
        setFieldErrors(prev => ({ ...prev, name: validation.error! }));
      }
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setFormData(prev => ({ ...prev, password }));

    // Clear previous error
    setFieldErrors(prev => ({ ...prev, password: '' }));

    // Validate password if not empty
    if (password) {
      const validation = validatePassword(password);
      if (!validation.isValid) {
        setFieldErrors(prev => ({ ...prev, password: validation.error! }));
      }
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const confirmPassword = e.target.value;
    setFormData(prev => ({ ...prev, confirmPassword }));

    // Clear previous error
    setFieldErrors(prev => ({ ...prev, confirmPassword: '' }));

    // Validate confirm password if not empty
    if (confirmPassword && formData.password) {
      if (confirmPassword !== formData.password) {
        setFieldErrors(prev => ({ ...prev, confirmPassword: 'Şifrələr uyğun gəlmir' }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({ name: '', email: '', password: '', confirmPassword: '' });

    // Comprehensive validation
    const nameValidation = validateName(formData.name);
    const emailValidation = validateEmail(formData.email);
    const passwordValidation = validatePassword(formData.password);

    let hasErrors = false;
    const newFieldErrors = { name: '', email: '', password: '', confirmPassword: '' };

    if (!nameValidation.isValid) {
      newFieldErrors.name = nameValidation.error!;
      hasErrors = true;
    }

    if (!emailValidation.isValid) {
      newFieldErrors.email = emailValidation.error!;
      hasErrors = true;
    }

    if (!passwordValidation.isValid) {
      newFieldErrors.password = passwordValidation.error!;
      hasErrors = true;
    }

    if (formData.password !== formData.confirmPassword) {
      newFieldErrors.confirmPassword = 'Şifrələr uyğun gəlmir. Zəhmət olmasa yenidən daxil edin.';
      hasErrors = true;
    }

    if (hasErrors) {
      setFieldErrors(newFieldErrors);
      setLoading(false);
      return;
    }

    try {
      await register(formData.name.trim(), formData.email.trim().toLowerCase(), formData.password);
      onSuccess?.();
    } catch (error) {
      console.error('Registration failed:', error);
      if (error instanceof Error) {
        // Check for specific error types and provide appropriate Azerbaijani messages
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          setError('Bu e-poçt ünvanı artıq mövcuddur. Başqa e-poçt ünvanı istifadə edin.');
        } else if (error.message.includes('invalid email')) {
          setError('E-poçt ünvanı düzgün formatda deyil.');
        } else if (error.message.includes('weak password')) {
          setError('Şifrə çox sadədir. Daha güclü şifrə seçin.');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          setError('İnternet bağlantısı problemi. Zəhmət olmasa yenidən cəhd edin.');
        } else {
          setError('Qeydiyyat zamanı xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.');
        }
      } else {
        setError('Qeydiyyat zamanı xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLinkedInLogin = () => {
    // Show loading state
    setLoading(true);
    setError('');

    try {
      // LinkedIn OAuth login
      window.location.href = '/api/auth/linkedin';
    } catch (error) {
      setError('LinkedIn ilə qeydiyyat zamanı xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* LinkedIn Login Button */}
      <button
        type="button"
        onClick={handleLinkedInLogin}
        disabled={loading}
        className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0077B5">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
        LinkedIn ilə qeydiyyat
      </button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">və ya</span>
        </div>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Ad Soyad
          </label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={handleNameChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              fieldErrors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
            }`}
          />
          {fieldErrors.name && (
            <p className="mt-2 text-sm text-red-600">{fieldErrors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            E-poçt
          </label>
          <input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={handleEmailChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              fieldErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
            }`}
          />
          {fieldErrors.email && (
            <p className="mt-2 text-sm text-red-600">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Şifrə
          </label>
          <input
            id="password"
            type="password"
            required
            value={formData.password}
            onChange={handlePasswordChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              fieldErrors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
            }`}
          />
          {fieldErrors.password && (
            <p className="mt-2 text-sm text-red-600">{fieldErrors.password}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Şifrəni təsdiq edin
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={formData.confirmPassword}
            onChange={handleConfirmPasswordChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              fieldErrors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
            }`}
          />
          {fieldErrors.confirmPassword && (
            <p className="mt-2 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
          )}
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || Object.values(fieldErrors).some(error => error !== '')}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Qeydiyyat edilir...' : 'Qeydiyyat'}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Hesabınız var? Giriş edin
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
