import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText("Default")).toBeInTheDocument();
  });

  it("applies success variant classes", () => {
    render(<Badge variant="success">Paid</Badge>);
    expect(screen.getByText("Paid")).toHaveClass("text-emerald-700");
  });

  it("applies destructive variant classes", () => {
    render(<Badge variant="destructive">Failed</Badge>);
    expect(screen.getByText("Failed")).toHaveClass("text-red-700");
  });

  it("applies rose variant classes (refunded)", () => {
    render(<Badge variant="rose">Refunded</Badge>);
    expect(screen.getByText("Refunded")).toHaveClass("text-rose-700");
  });
});
