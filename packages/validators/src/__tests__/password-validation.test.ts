import { describe, expect, it } from "vitest";
import { passwordCheck, passwordStrength } from "../password-validation";

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

  it(" - has upper case characters", () => {
    const score = passwordStrength("T");
    expect(score).toBe(1);
  });

  it(" - has lower case characters", () => {
    const score = passwordStrength("t");
    expect(score).toBe(1);
  });

  it(" - has numbers", () => {
    const score = passwordStrength("1");
    expect(score).toBe(1);
  });

  it(" - has symbols", () => {
    const score = passwordStrength("$");
    expect(score).toBe(1);
  });

  it(" - has two conditions met", () => {
    const score = passwordStrength("1$");
    expect(score).toBe(2);
  });

  it(" - has three conditions met", () => {
    const score = passwordStrength("1$T");
    expect(score).toBe(3);
  });

  it(" - has four conditions met", () => {
    const score = passwordStrength("t1$T");
    expect(score).toBe(4);
  });

  it(" - has five conditions met", () => {
    const score = passwordStrength("t1$T1234");
    expect(score).toBe(5);
  });
});
