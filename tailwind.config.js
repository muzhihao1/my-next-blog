/** @type {import('tailwindcss').Config} */ module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.5rem",
        sm: "2rem",
        lg: "4rem",
        xl: "5rem",
        "2xl": "6rem",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)"],
        playfair: ["var(--font-playfair)"],
      },
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          foreground: "var(--color-primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          hover: "var(--color-secondary-hover)",
          foreground: "var(--color-secondary-foreground)",
        },
        background: {
          DEFAULT: "var(--color-background)",
          secondary: "var(--color-background-secondary)",
          tertiary: "var(--color-background-tertiary)",
        },
        foreground: {
          DEFAULT: "var(--color-foreground)",
          secondary: "var(--color-foreground-secondary)",
          tertiary: "var(--color-foreground-tertiary)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          hover: "var(--color-border-hover)",
        },
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        error: "var(--color-error)",
        info: "var(--color-info)",
        overlay: "var(--color-overlay)",
        shadow: "var(--color-shadow)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
