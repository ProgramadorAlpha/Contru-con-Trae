/**
 * Sanitization utilities for user inputs
 * Prevents XSS and other security vulnerabilities
 */

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param text - The text to escape
 * @returns The escaped text
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }

  return text.replace(/[&<>"'/]/g, (char) => map[char])
}

/**
 * Sanitizes a string by trimming and limiting length
 * @param text - The text to sanitize
 * @param maxLength - Maximum allowed length
 * @returns The sanitized text
 */
export function sanitizeText(text: string, maxLength: number = 1000): string {
  return text.trim().slice(0, maxLength)
}

/**
 * Validates and sanitizes a number input
 * @param value - The value to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns The sanitized number or null if invalid
 */
export function sanitizeNumber(
  value: string | number,
  min: number = 0,
  max: number = Number.MAX_SAFE_INTEGER
): number | null {
  const num = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(num) || num < min || num > max) {
    return null
  }

  return num
}

/**
 * Validates and sanitizes a date string
 * @param dateString - The date string to validate
 * @returns The sanitized date string or null if invalid
 */
export function sanitizeDate(dateString: string): string | null {
  const date = new Date(dateString)

  if (isNaN(date.getTime())) {
    return null
  }

  // Return ISO format
  return date.toISOString().split('T')[0]
}

/**
 * Validates and sanitizes a time string (HH:mm format)
 * @param timeString - The time string to validate
 * @returns The sanitized time string or null if invalid
 */
export function sanitizeTime(timeString: string): string | null {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/

  if (!timeRegex.test(timeString)) {
    return null
  }

  return timeString
}

/**
 * Removes potentially dangerous characters from input
 * @param text - The text to clean
 * @returns The cleaned text
 */
export function removeSpecialChars(text: string): string {
  // Remove control characters and other potentially dangerous chars
  return text.replace(/[\x00-\x1F\x7F-\x9F]/g, '')
}

/**
 * Validates email format
 * @param email - The email to validate
 * @returns True if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Sanitizes an object by applying sanitization to all string values
 * @param obj - The object to sanitize
 * @param maxLength - Maximum length for string values
 * @returns The sanitized object
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  maxLength: number = 1000
): T {
  const sanitized: any = {}

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value, maxLength)
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value, maxLength)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized as T
}
