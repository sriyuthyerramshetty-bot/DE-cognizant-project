/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        riseFade: {
          "0%": { transform: "translateY(24px)", opacity: "0" },
          "15%": { transform: "translateY(0)", opacity: "1" },
          "80%": { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(10px)", opacity: "0" },
        },
      },
      animation: {
        "rise-fade": "riseFade 2600ms ease forwards",
      },
    },
  },
  plugins: [],
};