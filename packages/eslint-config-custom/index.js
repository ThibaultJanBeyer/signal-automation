/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "turbo",
    "plugin:@typescript-eslint/recommended",
    // disabled for now as it needs more work to have it pass
    // "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "next",
    "prettier",
  ],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    "@typescript-eslint/prefer-ts-expect-error": "error",
    "@typescript-eslint/restrict-template-expressions": "off",
    "@typescript-eslint/no-explicit-any": "off",

    "no-unused-vars": "off", // required for the next one to work
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
        ignoreRestSiblings: true,
      },
    ],
    "@typescript-eslint/ban-types": "warn",
    "@typescript-eslint/consistent-type-imports": [
      "error",
      { prefer: "type-imports", fixStyle: "inline-type-imports" },
    ],
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react/no-unescaped-entities": "off",
  },
  reportUnusedDisableDirectives: true,
};
