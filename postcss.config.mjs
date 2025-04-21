const config = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Adjust this path based on your project structure
    "./public/index.html",
    "./cypress/**/*.{js,jsx,ts,tsx}", // Include Cypress tests
  ],
  theme: {
    extend: {},
  },
  plugins: ["@tailwindcss/postcss"],
};

export default config;
