export const PASSWORD_POLICY_MESSAGE =
  'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.';

export function isStrongPassword(password: string): boolean {
  if (password.length < 8) {
    return false;
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  return hasUppercase && hasLowercase && hasNumber && hasSpecial;
}

export function getPasswordPolicyError(password: string): string | null {
  return isStrongPassword(password) ? null : PASSWORD_POLICY_MESSAGE;
}
