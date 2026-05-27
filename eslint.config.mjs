import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

/** @type {import("eslint").Linter.Config[]} */
const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**"],
  },
  ...nextCoreWebVitals,
  {
    rules: {
      // Existing codebase uses standard sync-from-props effects; too noisy for this pass.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/immutability": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },
];

export default eslintConfig;
