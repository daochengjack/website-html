module.exports = {
  extends: ["next/core-web-vitals", "next/typescript"],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-var-requires": "off",
    "react/no-unescaped-entities": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
    "import/no-unresolved": "warn"
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};