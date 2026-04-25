import { describe, it, expect } from "vitest";
import { formatPrice, safeHttpHref } from "./format";

describe("formatPrice", () => {
  it("formats with $ and two decimals", () => {
    expect(formatPrice(1234.5)).toBe("$1,234.50");
    expect(formatPrice(0)).toBe("$0.00");
  });
});

describe("safeHttpHref", () => {
  it("passes http and https URLs through", () => {
    expect(safeHttpHref("https://example.com")).toBe("https://example.com");
    expect(safeHttpHref("http://example.com/path?q=1")).toBe("http://example.com/path?q=1");
  });

  it("rejects javascript: URIs", () => {
    expect(safeHttpHref("javascript:alert(1)")).toBeNull();
    expect(safeHttpHref("JAVASCRIPT:alert(1)")).toBeNull();
  });

  it("rejects data:, vbscript:, file:, and other schemes", () => {
    expect(safeHttpHref("data:text/html,<script>alert(1)</script>")).toBeNull();
    expect(safeHttpHref("vbscript:msgbox(1)")).toBeNull();
    expect(safeHttpHref("file:///etc/passwd")).toBeNull();
    expect(safeHttpHref("mailto:x@y.com")).toBeNull();
  });

  it("handles null / empty / malformed", () => {
    expect(safeHttpHref(null)).toBeNull();
    expect(safeHttpHref(undefined)).toBeNull();
    expect(safeHttpHref("")).toBeNull();
    expect(safeHttpHref("not a url")).toBeNull();
  });
});
