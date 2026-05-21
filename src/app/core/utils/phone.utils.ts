import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { parsePhoneNumberWithError, isValidPhoneNumber } from 'libphonenumber-js';

/**
 * Angular validator that accepts Kenyan numbers in any of these formats:
 *   07XXXXXXXX  /  01XXXXXXXX  /  254XXXXXXXXX  /  +254XXXXXXXXX
 */
export const kenyanPhoneValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const raw: string = (control.value ?? '').trim();
  if (!raw) return null; // let Validators.required handle empty

  try {
    if (isValidPhoneNumber(raw, 'KE')) return null;
  } catch {
    // invalid input – fall through to error
  }
  return { kenyanPhone: true };
};

/**
 * Strips all non-digit/+ chars, parses with libphonenumber for KE, and
 * returns the E.164 digits-only format: 254XXXXXXXXX (no leading +).
 *
 * Returns the raw value unchanged when parsing fails (should not happen
 * after validation passes).
 */
export function normalizeKenyanPhone(raw: string): string {
  try {
    const parsed = parsePhoneNumberWithError(raw.trim(), 'KE');
    // E.164 is "+254XXXXXXXXX" — strip the leading "+"
    return parsed.format('E.164').replace(/^\+/, '');
  } catch {
    return raw;
  }
}
