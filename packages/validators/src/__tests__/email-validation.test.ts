import { describe, expect, it } from "vitest";
import { isValidEmail } from "../email-validation";

describe("Email validation", () => {
  it(" - valid email - simple email address", () => {
    expect(isValidEmail("test@example.com")).toBe(true);
  });

  it(" - valid email - with some special characters", () => {
    expect(isValidEmail("fa_ke.e-mail+tag%ged@mail.example-test.com")).toBe(
      true,
    );
  });

  it(" - valid email - with all acceptable characters", () => {
    expect(
      isValidEmail(
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._%+-@abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-.abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
      ),
    ).toBe(true);
  });

  it(" - no local-part (username)", () => {
    expect(isValidEmail("@example.com")).toBe(false);
  });

  it(" - no domain", () => {
    expect(isValidEmail("test@.com")).toBe(false);
  });

  it(" - no tld", () => {
    expect(isValidEmail("test@example")).toBe(false);
  });

  it(" - short tld", () => {
    expect(isValidEmail("test@example.c")).toBe(false);
  });

  it(" - invalid local-part character", () => {
    expect(isValidEmail("te!st@example.c")).toBe(false);
  });

  it(" - invalid local-part character", () => {
    expect(isValidEmail("te!st@example.c")).toBe(false);
  });

  it(" - invalid domain character", () => {
    expect(isValidEmail("test@exam_ple.c")).toBe(false);
  });

  it(" - invalid tld character", () => {
    expect(isValidEmail("test@example.123")).toBe(false);
  });
});
