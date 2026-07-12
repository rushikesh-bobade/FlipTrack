import { describe, it, expect } from "vitest";
import { sanitizeCsvField } from "./csv.server";

describe("sanitizeCsvField", () => {
  it("passes normal strings through untouched", () => {
    expect(sanitizeCsvField("Hello World")).toBe("Hello World");
    expect(sanitizeCsvField("12345")).toBe("12345");
    expect(sanitizeCsvField("")).toBe("");
  });

  it("doubles embedded double quotes", () => {
    expect(sanitizeCsvField('She said "hi"')).toBe('She said ""hi""');
    expect(sanitizeCsvField('"leading quote')).toBe('""leading quote');
  });

  it("prefixes formula-trigger characters with a single quote", () => {
    expect(sanitizeCsvField("=SUM(A1:A2)")).toBe("'=SUM(A1:A2)");
    expect(sanitizeCsvField("+1234")).toBe("'+1234");
    expect(sanitizeCsvField("-1234")).toBe("'-1234");
    expect(sanitizeCsvField("@cmd")).toBe("'@cmd");
    expect(sanitizeCsvField("\tindented")).toBe("'\tindented");
    expect(sanitizeCsvField("\rcarriage")).toBe("'\rcarriage");
  });

  it("checks the trigger only after quote-doubling has been applied", () => {
    // Leading quote becomes "" first; "" doesn't match the trigger regex,
    // so no ' prefix is added even though the raw input started with a
    // character that looks quote-like.
    expect(sanitizeCsvField('"=cmd')).toBe('""=cmd');
  });

  it("handles null and undefined by treating them as empty strings", () => {
    expect(sanitizeCsvField(null)).toBe("");
    expect(sanitizeCsvField(undefined)).toBe("");
  });

  it("does not currently neutralize a leading newline (known gap)", () => {
    // \n is not in the trigger regex [=+\-@\t\r], so this passes through
    // unprefixed. Documenting current behavior, not asserting it's correct.
    expect(sanitizeCsvField("\n=cmd")).toBe("\n=cmd");
  });
});
