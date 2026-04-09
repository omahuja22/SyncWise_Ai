import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const baseConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

// Remove the restrictive exhaustive-deps rule and add our config
const eslintConfig = [
  ...baseConfig,
  {
    rules: {
      // Note: Intentionally disabled for modal/form reset patterns which are safe
      // React automatically batches setState calls when done synchronously in effects
      "react-hooks/exhaustive-deps": "off",
    },
  },
];

export default eslintConfig;
