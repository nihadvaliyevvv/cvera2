/**
 * Email validation utilities
 * Provides comprehensive email format validation
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates email format using comprehensive regex and additional checks
 */
export function validateEmail(email: string): ValidationResult {
  // Remove whitespace
  const trimmedEmail = email.trim();

  // Basic checks
  if (!trimmedEmail) {
    return { isValid: false, error: 'E-poçt ünvanı tələb olunur' };
  }

  // Check minimum length
  if (trimmedEmail.length < 5) {
    return { isValid: false, error: 'E-poçt ünvanı çox qısadır' };
  }

  // Check maximum length (RFC 5321 limit)
  if (trimmedEmail.length > 254) {
    return { isValid: false, error: 'E-poçt ünvanı çox uzundur' };
  }

  // Comprehensive email regex pattern
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, error: 'E-poçt formatı yanlışdır' };
  }

  // Check for multiple @ symbols
  const atCount = (trimmedEmail.match(/@/g) || []).length;
  if (atCount !== 1) {
    return { isValid: false, error: 'E-poçt formatı yanlışdır' };
  }

  // Split local and domain parts
  const [localPart, domainPart] = trimmedEmail.split('@');

  // Validate local part (before @)
  if (!localPart || localPart.length === 0) {
    return { isValid: false, error: 'E-poçt formatı yanlışdır' };
  }

  if (localPart.length > 64) {
    return { isValid: false, error: 'E-poçt formatı yanlışdır' };
  }

  // Check for consecutive dots in local part
  if (localPart.includes('..')) {
    return { isValid: false, error: 'E-poçt formatı yanlışdır' };
  }

  // Check if local part starts or ends with dot
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return { isValid: false, error: 'E-poçt formatı yanlışdır' };
  }

  // Validate domain part (after @)
  if (!domainPart || domainPart.length === 0) {
    return { isValid: false, error: 'E-poçt formatı yanlışdır' };
  }

  if (domainPart.length > 253) {
    return { isValid: false, error: 'E-poçt formatı yanlışdır' };
  }

  // Check for valid domain format
  const domainRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!domainRegex.test(domainPart)) {
    return { isValid: false, error: 'E-poçt formatı yanlışdır' };
  }

  // Check if domain has at least one dot
  if (!domainPart.includes('.')) {
    return { isValid: false, error: 'E-poçt formatı yanlışdır' };
  }

  // Check if domain ends with valid TLD (at least 2 characters)
  const tld = domainPart.split('.').pop();
  if (!tld || tld.length < 2) {
    return { isValid: false, error: 'E-poçt formatı yanlışdır' };
  }

  // Check for invalid characters in domain
  if (domainPart.includes('..') || domainPart.startsWith('.') || domainPart.endsWith('.')) {
    return { isValid: false, error: 'E-poçt formatı yanlışdır' };
  }

  // Check for common invalid patterns
  const invalidPatterns = [
    /^[^@]+@[^@]+@/, // Multiple @ symbols
    /^@/, // Starts with @
    /@$/, // Ends with @
    /\s/, // Contains whitespace
    /\.{2,}/, // Multiple consecutive dots
  ];

  for (const pattern of invalidPatterns) {
    if (pattern.test(trimmedEmail)) {
      return { isValid: false, error: 'E-poçt formatı yanlışdır' };
    }
  }

  return { isValid: true };
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Şifrə tələb olunur' };
  }

  if (password.length < 6) {
    return { isValid: false, error: 'Şifrə ən azı 6 simvoldan ibarət olmalıdır' };
  }

  if (password.length > 128) {
    return { isValid: false, error: 'Şifrə çox uzundur' };
  }

  return { isValid: true };
}

/**
 * Validates name field
 */
export function validateName(name: string): ValidationResult {
  const trimmedName = name.trim();
  
  if (!trimmedName) {
    return { isValid: false, error: 'Ad Soyad tələb olunur' };
  }

  if (trimmedName.length < 2) {
    return { isValid: false, error: 'Ad Soyad ən azı 2 simvoldan ibarət olmalıdır' };
  }

  if (trimmedName.length > 100) {
    return { isValid: false, error: 'Ad Soyad çox uzundur' };
  }

  // More strict validation - only letters, spaces, apostrophes, and hyphens
  // Includes Azerbaijani characters
  const nameRegex = /^[a-zA-ZğĞıİöÖüÜşŞçÇəƏ\s'-]+$/;
  if (!nameRegex.test(trimmedName)) {
    return { isValid: false, error: 'Ad/Soyad yalnız hərflərdən ibarət olmalıdır' };
  }

  // Check for only spaces
  if (trimmedName.replace(/\s/g, '').length === 0) {
    return { isValid: false, error: 'Ad Soyad yalnız boşluqlardan ibarət ola bilməz' };
  }

  // Check for excessive spaces (more than 2 consecutive spaces)
  if (/\s{3,}/.test(trimmedName)) {
    return { isValid: false, error: 'Ad Soyad çox boşluq daxil edir' };
  }

  // Check if it starts or ends with special characters
  if (/^[-'\s]|[-'\s]$/.test(trimmedName)) {
    return { isValid: false, error: 'Ad Soyad xüsusi işarələrlə başlaya və ya bitə bilməz' };
  }

  // Check for numbers
  if (/\d/.test(trimmedName)) {
    return { isValid: false, error: 'Ad/Soyad yalnız hərflərdən ibarət olmalıdır' };
  }

  // Check for special symbols (except allowed ones)
  if (/[^a-zA-ZğĞıİöÖüÜşŞçÇəƏ\s'-]/.test(trimmedName)) {
    return { isValid: false, error: 'Ad/Soyad yalnız hərflərdən ibarət olmalıdır' };
  }

  return { isValid: true };
}
