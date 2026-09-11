/**
 * Ghanaian Input Format Adjusters & Input Masks
 * Enforces standardized validation formatting for Ghana Card, GhanaPost GPS, and Phone numbers.
 */

/**
 * Enforces the Ghana Card format: GHA-XXXXXXXXX-X (e.g., GHA-728190342-1)
 * Automatically injects leading 'GHA-' and trailing hyphens as digits are typed.
 */
export function formatGhanaCard(raw: string): string {
  if (!raw) return '';
  
  // Remove spaces, hyphens, and sanitize
  let clean = raw.trim().toUpperCase();
  
  // Strip existing 'GHA' or 'GHA-' prefix to extract raw content
  if (clean.startsWith('GHA-')) {
    clean = clean.slice(4);
  } else if (clean.startsWith('GHA')) {
    clean = clean.slice(3);
  }
  
  // Remove any remaining non-alphanumeric characters
  clean = clean.replace(/[^0-9A-Z]/g, '');
  
  // Ghana card body is 9 digits + 1 check digit = 10 characters total
  const limited = clean.slice(0, 10);
  
  if (limited.length === 0) {
    return 'GHA-';
  }
  
  if (limited.length <= 9) {
    return `GHA-${limited}`;
  }
  
  return `GHA-${limited.slice(0, 9)}-${limited.slice(9, 10)}`;
}

/**
 * Enforces GhanaPost GPS Digital Address format: XX-XXX-XXXX or XXX-XXX-XXXX (e.g., GA-183-9023)
 * Automatically injects hyphens and capitalizes district codes.
 */
export function formatGhanaPostGps(raw: string): string {
  if (!raw) return '';
  
  // Remove non-alphanumeric characters
  const clean = raw.replace(/[^0-9A-Za-z]/g, '').toUpperCase();
  if (clean.length === 0) return '';
  
  // Extract leading letters (District/Region code, e.g. GA, AK, WS, ER, CR, GHA, etc.)
  const letterMatch = clean.match(/^[A-Z]+/);
  if (!letterMatch) {
    // If user starts with numbers, fallback formatting
    if (clean.length <= 2) return clean;
    if (clean.length <= 5) return `${clean.slice(0, 2)}-${clean.slice(2)}`;
    return `${clean.slice(0, 2)}-${clean.slice(2, 5)}-${clean.slice(5, 9)}`;
  }
  
  const prefix = letterMatch[0].slice(0, 3); // Up to 3 letters (e.g., GA, AK, GHA)
  const rest = clean.slice(prefix.length).replace(/[^0-9]/g, ''); // Digits only
  
  if (rest.length === 0) {
    return prefix;
  }
  
  if (rest.length <= 3) {
    return `${prefix}-${rest}`;
  }
  
  return `${prefix}-${rest.slice(0, 3)}-${rest.slice(3, 7)}`;
}

/**
 * Enforces Ghanaian telephone number format: +233 XX XXX XXXX
 * Automatically strips local leading '0' or converts raw digits to clean +233 blocks.
 */
export function formatGhanaPhone(raw: string): string {
  if (!raw) return '';
  
  // Extract all digits
  let digits = raw.replace(/\D/g, '');
  
  // If user typed 233 at the beginning, strip it to normalize
  if (digits.startsWith('233')) {
    digits = digits.slice(3);
  }
  
  // If user typed leading 0 (e.g., 0244128901 -> 244128901), strip it
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  
  // Maximum 9 national digits (e.g., 24 412 8901)
  const national = digits.slice(0, 9);
  
  if (national.length === 0) {
    return '+233 ';
  }
  
  if (national.length <= 2) {
    return `+233 ${national}`;
  }
  
  if (national.length <= 5) {
    return `+233 ${national.slice(0, 2)} ${national.slice(2)}`;
  }
  
  return `+233 ${national.slice(0, 2)} ${national.slice(2, 5)} ${national.slice(5, 9)}`;
}
