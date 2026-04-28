export const MIN_PASSWORD_LENGTH = 15;

export const PASSWORD_POLICY_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

export const PASSWORD_POLICY_MESSAGE =
  'Password must be at least 15 characters long and include uppercase, lowercase, a number, and a special character.';
