import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/** Hashes a plain-text password with bcrypt. Never store or log plain-text passwords. */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/** Compares a plain-text password against a bcrypt hash. */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export interface PasswordStrengthResult {
  valid: boolean;
  message?: string;
}

/**
 * Enforces a reasonable password strength policy:
 * min 8 chars, at least one uppercase, one lowercase, one digit.
 */
export function validatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) return { valid: false, message: "Password is required." };
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long." };
  }
  if (password.length > 128) {
    return { valid: false, message: "Password must be at most 128 characters long." };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter." };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter." };
  }
  if (!/\d/.test(password)) {
    return { valid: false, message: "Password must contain at least one number." };
  }
  return { valid: true };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return typeof email === "string" && EMAIL_RE.test(email) && email.length <= 254;
}
