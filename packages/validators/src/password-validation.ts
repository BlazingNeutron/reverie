const UPPERCASE = "[A-Z]";
const LOWERCASE = "[a-z]";
const NUMBERS = "[0-9]";
const SYMBOLS = "[#?!@$%^&*-]";
const MIN_LENGTH = 8;

export function passwordCheck(password: string) {
  const patternString =
    "^(?=.*?" +
    UPPERCASE +
    ")(?=.*?" +
    LOWERCASE +
    ")(?=.*?" +
    NUMBERS +
    ")(?=.*?" +
    SYMBOLS +
    ").{" +
    MIN_LENGTH +
    ",}$";
  const passwordRegex = new RegExp(patternString);
  return passwordRegex.test(password);
}

export function passwordStrength(password: string) {
  const result = passwordStrengthEval(password);
  return result.score;
}

export type PasswordStrengthEvaluation = {
  score: number;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
  isLongEnough: boolean;
};

export function passwordStrengthEval(
  password: string,
): PasswordStrengthEvaluation {
  const result = {
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSymbol: false,
    isLongEnough: false,
    score: 0,
  };

  if (!password) return result;

  if (password.length >= MIN_LENGTH) {
    result.isLongEnough = true;
    result.score += 1;
  }
  if (new RegExp(LOWERCASE).test(password)) {
    result.hasLowerCase = true;
    result.score += 1;
  }
  if (new RegExp(UPPERCASE).test(password)) {
    result.hasUpperCase = true;
    result.score += 1;
  }
  if (new RegExp(NUMBERS).test(password)) {
    result.hasNumber = true;
    result.score += 1;
  }
  if (new RegExp(SYMBOLS).test(password)) {
    result.hasSymbol = true;
    result.score += 1;
  }
  return result;
}
