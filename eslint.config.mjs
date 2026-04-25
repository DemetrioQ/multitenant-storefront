import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Ours:
    "coverage/**",
    ".husky/**",
  ]),
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      // Pre-existing tech debt: many `catch (err: any)` blocks. Use getErrorMessage()
      // from lib/types.ts in new code. Sweeping the existing ones is on the backlog.
      "@typescript-eslint/no-explicit-any": "warn",

      // Nudge devs toward UI primitives. Raw <button className="bg-brand|bg-[var(--brand)]|...">
      // should use <Button>/<Input>/<Badge>/<Card> from components/ui.
      // See components/ui/README.md.
      "no-restricted-syntax": [
        "warn",
        {
          selector:
            "JSXOpeningElement[name.name='button'] JSXAttribute[name.name='className'] Literal[value=/bg-brand|bg-\\[var\\(--brand\\)\\]/]",
          message:
            "Use <Button> from components/ui instead of a raw <button> with brand-coloured classes.",
        },
      ],
    },
  },
  // Relax the drift rule inside primitives + complex bespoke widgets.
  {
    files: ["components/ui/**", "components/AddToCartButton.tsx", "components/Header.tsx"],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
  // Test files: looser rules.
  {
    files: ["**/*.test.{ts,tsx}", "test/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-restricted-syntax": "off",
    },
  },
]);

export default eslintConfig;
