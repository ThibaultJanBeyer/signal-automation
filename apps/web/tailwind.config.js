// @ts-nocheck
const config = require("@sa/ui/tailwindConfig");

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...config,
  content: [...config.content, "../../packages/ui/src/**/*.{js,ts,jsx,tsx}"],
};
