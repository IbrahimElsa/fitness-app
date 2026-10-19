/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  // ThemeContext toggles a `dark-mode` class on <body>. Make `dark:` utilities
  // follow that toggle instead of the OS preference (Tailwind's default).
  darkMode: ['class', '.dark-mode'],
  theme: {
    extend: {},
  },
  plugins: [],
}
