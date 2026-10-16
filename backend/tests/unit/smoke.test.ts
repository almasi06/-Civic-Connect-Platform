import { describe, it, expect } from "vitest";

describe("Smoke test", () => {
  it("adds 1 + 1", () => {
    expect(1 + 1).toBe(2);
  });

  it("has DATABASE_URL set", () => {
    expect(process.env.DATABASE_URL).toBeDefined();
  });
});