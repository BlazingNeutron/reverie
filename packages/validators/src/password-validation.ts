const UPPERCASE = "[A-Z]";
const LOWERCASE = "[a-z]";
const NUMBERS = "[0-9]";
const SYMBOLS = "[#?!@$%^&*-]";
const MIN_LENGTH = 8;

export function passwordCheck(password: string) {
    const patternString = "^(?=.*?" + UPPERCASE +")(?=.*?" + LOWERCASE +")(?=.*?" + NUMBERS + ")(?=.*?" + SYMBOLS + ").{" + MIN_LENGTH + ",}$";
    const passwordRegex = new RegExp(patternString);
    return passwordRegex.test(password);
}

export function passwordStrength(password: string) {
    let score = 0;

    if (!password) return 0;

    if (password.length >= MIN_LENGTH) {
        score += 1;
    }
    if (new RegExp(LOWERCASE).test(password)) {
        score += 1;
    }
    if (new RegExp(UPPERCASE).test(password)) {
        score += 1;
    }
    if (new RegExp(NUMBERS).test(password)) {
        score += 1;
    }
    if (new RegExp(SYMBOLS).test(password)) {
        score += 1;
    }
    return score;
}