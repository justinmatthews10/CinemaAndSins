export type SignupInput = {
  email: string;
  password: string;
  name: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthResult = {
  error: string | null;
  needsApproval?: boolean;
};

export type ValidationResult = Partial<Record<keyof SignupInput, string>>;

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): boolean {
  return password.length >= 6;
}

export function validateSignupForm(input: SignupInput): ValidationResult {
  const errors: ValidationResult = {};
  if (!input.name.trim()) {
    errors.name = "Name is required";
  }
  if (!validateEmail(input.email)) {
    errors.email = "Please enter a valid email address";
  }
  if (!validatePassword(input.password)) {
    errors.password = "Password must be at least 6 characters";
  }
  return errors;
}

export function validateLoginForm(input: LoginInput): ValidationResult {
  const errors: ValidationResult = {};
  if (!validateEmail(input.email)) {
    errors.email = "Please enter a valid email address";
  }
  if (!input.password) {
    errors.password = "Password is required";
  }
  return errors;
}

/**
 * Maps a Supabase auth error code/message to a user-friendly message.
 */
export function mapAuthError(error: { message?: string } | null): string {
  if (!error || !error.message) return "An unexpected error occurred";
  const msg = error.message.toLowerCase();
  if (msg.includes("invalid login credentials")) return "Invalid email or password";
  if (msg.includes("user already registered"))
    return "An account with this email already exists";
  if (msg.includes("email not confirmed"))
    return "Please check your email to confirm your account";
  return error.message;
}
