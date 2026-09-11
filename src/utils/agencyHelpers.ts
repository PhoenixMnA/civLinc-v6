import { ServiceAgency } from '../types';

/**
 * Cleanly truncates any text longer than maxLength (default: 25 chars)
 * and appends an ellipsis '...' without blowing out layout boundaries.
 */
export const truncateText = (text?: string, maxLength = 25): string => {
  if (!text) return '';
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1)}...`;
};

/**
 * Normalizes any agency key string (e.g. 'Ghana Police', 'police', 'Passport Office', 'passport', 'health', 'dvla')
 * into the 4 canonical categories: 'DVLA' | 'Passport' | 'Police' | 'Health' using case-insensitive parsing.
 */
export const normalizeServiceAgency = (agency?: string): ServiceAgency => {
  if (!agency) return 'DVLA';
  const lower = agency.toString().trim().toLowerCase();
  
  if (lower.includes('dvla') || lower.includes('driver') || lower.includes('license') || lower.includes('vehicle')) {
    return 'DVLA';
  }
  if (lower.includes('pass') || lower.includes('pac') || lower.includes('passport office')) {
    return 'Passport';
  }
  if (lower.includes('pol') || lower.includes('ghana police') || lower.includes('cop') || lower.includes('cid')) {
    return 'Police';
  }
  if (lower.includes('health') || lower.includes('ghs') || lower.includes('nhis') || lower.includes('opd') || lower.includes('hospital') || lower.includes('med')) {
    return 'Health';
  }
  
  return 'DVLA';
};

/**
 * Returns clean, formal display names for all 4 national agency categories.
 */
export const getAgencyDisplayName = (agency?: string): string => {
  const norm = normalizeServiceAgency(agency);
  switch (norm) {
    case 'DVLA':
      return 'DVLA';
    case 'Passport':
      return 'Passport Office';
    case 'Police':
      return 'Ghana Police';
    case 'Health':
      return 'Health (GHS)';
    default:
      return 'DVLA';
  }
};

/**
 * Returns standard badge style tokens for national agencies.
 */
export const getAgencyStyles = (agency?: string) => {
  const norm = normalizeServiceAgency(agency);
  switch (norm) {
    case 'DVLA':
      return {
        bg: 'bg-amber-500/15',
        border: 'border-amber-500/30',
        text: 'text-[#FCD116]',
        badge: 'bg-amber-500/20 text-[#FCD116] border border-amber-500/30',
        prefix: 'DVLA'
      };
    case 'Passport':
      return {
        bg: 'bg-red-600/15',
        border: 'border-[#CE1126]/30',
        text: 'text-red-400',
        badge: 'bg-red-600/20 text-red-300 border border-[#CE1126]/40',
        prefix: 'PASS'
      };
    case 'Police':
      return {
        bg: 'bg-blue-600/15',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        badge: 'bg-blue-600/20 text-blue-300 border border-blue-500/40',
        prefix: 'POL'
      };
    case 'Health':
      return {
        bg: 'bg-[#006B3F]/20',
        border: 'border-emerald-500/30',
        text: 'text-emerald-300',
        badge: 'bg-[#006B3F]/30 text-emerald-200 border border-emerald-500/40',
        prefix: 'GHS'
      };
  }
};
