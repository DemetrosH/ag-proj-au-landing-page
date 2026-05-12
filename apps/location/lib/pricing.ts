/**
 * Calculates the pricing factor based on rental duration.
 * 
 * Logic from Rentman coefficients:
 * 1 day: 1.0x
 * 2-3 days: 1.5x
 * 4-6 days: 2.0x
 * 7-13 days: 3.0x
 * 14-20 days: 4.0x (Extended pattern)
 * 21-27 days: 5.0x
 * 28-30 days: 6.0x
 */
export function calculateRentalFactor(days: number): number {
  if (days <= 0) return 0;
  if (days === 1) return 1.0;
  if (days <= 3) return 1.5;
  if (days <= 6) return 2.0;
  if (days <= 13) return 3.0;
  if (days <= 20) return 4.0;
  if (days <= 27) return 5.0;
  return 6.0; // Max 6x for a month
}

export const RENTAL_COEFFICIENTS = [
  { from: 1, to: 1, factor: 1.0 },
  { from: 2, to: 3, factor: 1.5 },
  { from: 4, to: 6, factor: 2.0 },
  { from: 7, to: 13, factor: 3.0 },
];
