import { describe, it, expect } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("merges class strings", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("lets later Tailwind classes win on conflict", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-foreground", "text-muted")).toBe("text-muted");
  });

  it("preserves non-conflicting classes", () => {
    expect(cn("px-2 py-1", "rounded-md")).toBe("px-2 py-1 rounded-md");
  });
});
