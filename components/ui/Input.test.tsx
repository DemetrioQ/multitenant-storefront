import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "./Input";

describe("Input", () => {
  it("renders and accepts typing", async () => {
    const user = userEvent.setup();
    render(<Input placeholder="email" />);
    const input = screen.getByPlaceholderText("email");
    await user.type(input, "a@b.com");
    expect(input).toHaveValue("a@b.com");
  });

  it("shows red border when error prop is true", () => {
    render(<Input placeholder="x" error />);
    const input = screen.getByPlaceholderText("x");
    expect(input).toHaveClass("border-red-500");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("uses default border when error is false", () => {
    render(<Input placeholder="x" />);
    expect(screen.getByPlaceholderText("x")).toHaveClass("border-border");
  });
});
