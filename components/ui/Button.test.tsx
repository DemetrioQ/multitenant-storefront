import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children and fires onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Add to cart</Button>);
    await user.click(screen.getByRole("button", { name: "Add to cart" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("applies primary variant by default", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-brand");
  });

  it("respects variant=destructive", () => {
    render(<Button variant="destructive">Remove</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-red-600");
  });

  it("respects size=pill", () => {
    render(<Button size="pill">Sign in</Button>);
    expect(screen.getByRole("button")).toHaveClass("rounded-full");
  });

  it("disables when prop set and skips clicks", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    );
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    await user.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders as child element when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/cart">View cart</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "View cart" });
    expect(link).toHaveAttribute("href", "/cart");
    expect(link).toHaveClass("bg-brand");
  });
});
