import { describe, expect, it } from "vitest";
import {
  passwordCheck,
  passwordStrength,
  passwordStrengthEval,
} from "../password-validation";

describe("Password validation", () => {
  it(" - too short", () => {
    const result = passwordCheck("test");
    expect(result).toBe(false);
  });

  it(" - is valid", () => {
    const result = passwordCheck("Test!1234");
    expect(result).toBe(true);
  });

  it(" - is valid", () => {
    const result = passwordCheck("Tes$1234");
    expect(result).toBe(true);
  });

  it(" - no upper case characters", () => {
    const result = passwordCheck("test!1234");
    expect(result).toBe(false);
  });

  it(" - no lower case characters", () => {
    const result = passwordCheck("TEST!1234");
    expect(result).toBe(false);
  });

  it(" - no symbols", () => {
    const result = passwordCheck("TEST12345");
    expect(result).toBe(false);
  });

  it(" - no numbers", () => {
    const result = passwordCheck("TEST!ABCD");
    expect(result).toBe(false);
  });

  it(" - blank password", () => {
    const result = passwordCheck("");
    expect(result).toBe(false);
  });
});

describe("Password Strength", () => {
  it(" - blank password", () => {
    const score = passwordStrength("");
    expect(score).toBe(0);
  });

  it(" - long password", () => {
    const score = passwordStrength("         ");
    expect(score).toBe(1);
  });

  it(" - Good password", () => {
    const score = passwordStrength("Test1234$");
    expect(score).toBe(5);
  });

  it(" - Greater than", () => {
    const score = passwordStrength("Test1234$");
    expect(score >= 3).toBe(true);
  });
});

describe("Password Strength Evaluation", () => {
  it(" - blank password", () => {
    const result = passwordStrengthEval("");
    expect(result).toEqual({
      hasUpperCase: false,
      hasLowerCase: false,
      hasNumber: false,
      hasSymbol: false,
      isLongEnough: false,
      score: 0,
    });
  });

  it(" - long password", () => {
    const result = passwordStrengthEval("         ");
    expect(result.score).toBe(1);
    expect(result.isLongEnough).toBe(true);
    expect(result.hasUpperCase).toBe(false);
    expect(result.hasLowerCase).toBe(false);
    expect(result.hasNumber).toBe(false);
    expect(result.hasSymbol).toBe(false);
  });

  it(" - has upper case characters", () => {
    const result = passwordStrengthEval("T");
    expect(result.score).toBe(1);
    expect(result.isLongEnough).toBe(false);
    expect(result.hasUpperCase).toBe(true);
    expect(result.hasLowerCase).toBe(false);
    expect(result.hasNumber).toBe(false);
    expect(result.hasSymbol).toBe(false);
  });

  it(" - has lower case characters", () => {
    const result = passwordStrengthEval("t");
    expect(result.score).toBe(1);
    expect(result.isLongEnough).toBe(false);
    expect(result.hasUpperCase).toBe(false);
    expect(result.hasLowerCase).toBe(true);
    expect(result.hasNumber).toBe(false);
    expect(result.hasSymbol).toBe(false);
  });

  it(" - has numbers", () => {
    const result = passwordStrengthEval("1");
    expect(result.score).toBe(1);
    expect(result.isLongEnough).toBe(false);
    expect(result.hasUpperCase).toBe(false);
    expect(result.hasLowerCase).toBe(false);
    expect(result.hasNumber).toBe(true);
    expect(result.hasSymbol).toBe(false);
  });

  it(" - has symbols", () => {
    const result = passwordStrengthEval("$");
    expect(result.score).toBe(1);
    expect(result.isLongEnough).toBe(false);
    expect(result.hasUpperCase).toBe(false);
    expect(result.hasLowerCase).toBe(false);
    expect(result.hasNumber).toBe(false);
    expect(result.hasSymbol).toBe(true);
  });

  it(" - has two conditions met", () => {
    const result = passwordStrengthEval("1$");
    expect(result.score).toBe(2);
    expect(result.isLongEnough).toBe(false);
    expect(result.hasUpperCase).toBe(false);
    expect(result.hasLowerCase).toBe(false);
    expect(result.hasNumber).toBe(true);
    expect(result.hasSymbol).toBe(true);
  });

  it(" - has three conditions met", () => {
    const result = passwordStrengthEval("1$T");
    expect(result.score).toBe(3);
    expect(result.isLongEnough).toBe(false);
    expect(result.hasUpperCase).toBe(true);
    expect(result.hasLowerCase).toBe(false);
    expect(result.hasNumber).toBe(true);
    expect(result.hasSymbol).toBe(true);
  });

  it(" - has four conditions met", () => {
    const result = passwordStrengthEval("t1$T");
    expect(result.score).toBe(4);
    expect(result.isLongEnough).toBe(false);
    expect(result.hasUpperCase).toBe(true);
    expect(result.hasLowerCase).toBe(true);
    expect(result.hasNumber).toBe(true);
    expect(result.hasSymbol).toBe(true);
  });

  it(" - has five conditions met", () => {
    const result = passwordStrengthEval("t1$T1234");
    expect(result.score).toBe(5);
    expect(result.isLongEnough).toBe(true);
    expect(result.hasUpperCase).toBe(true);
    expect(result.hasLowerCase).toBe(true);
    expect(result.hasNumber).toBe(true);
    expect(result.hasSymbol).toBe(true);
  });
});
