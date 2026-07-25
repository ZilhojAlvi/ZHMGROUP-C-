export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export function validateEmail(email: string): ValidationResult {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return { valid: false, message: "Email is required." };
  if (!re.test(email)) return { valid: false, message: "Enter a valid email address." };
  return { valid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) return { valid: false, message: "Password is required." };
  if (password.length < 8) return { valid: false, message: "Password must be at least 8 characters." };
  if (!/[a-z]/.test(password)) return { valid: false, message: "Include at least one lowercase letter." };
  if (!/[A-Z]/.test(password)) return { valid: false, message: "Include at least one uppercase letter." };
  if (!/\d/.test(password)) return { valid: false, message: "Include at least one number." };
  return { valid: true };
}

export function validateRequired(value: string, label: string): ValidationResult {
  if (!value || !value.trim()) return { valid: false, message: `${label} is required.` };
  return { valid: true };
}

export function validatePhone(phone: string): ValidationResult {
  const re = /^[+()\-\s\d]{7,20}$/;
  if (!phone) return { valid: false, message: "Phone number is required." };
  if (!re.test(phone)) return { valid: false, message: "Enter a valid phone number." };
  return { valid: true };
}

export function validateNumberRange(
  value: number,
  min: number,
  max: number,
  label: string
): ValidationResult {
  if (Number.isNaN(value)) return { valid: false, message: `${label} must be a number.` };
  if (value < min || value > max)
    return { valid: false, message: `${label} must be between ${min} and ${max}.` };
  return { valid: true };
}
