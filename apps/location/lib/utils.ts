/**
 * Utility functions for the location application
 */

/**
 * Normalizes a string by stripping accents/diacritics, lowercasing, and trimming whitespace.
 * Useful for accent-insensitive search queries.
 */
export function normalizeString(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
