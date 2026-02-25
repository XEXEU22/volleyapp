/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.tsx",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: "#007AFF", // Original iOS Blue
                "background-light": "#f2f2f7",
                "background-dark": "#1c1c1e", // Original dark gray
                "card-dark": "#2c2c2e", // Lighter card for dark mode
                "accent-orange": "#FF9500" // Original iOS Orange
            },
            fontFamily: {
                display: ["Lexend", "sans-serif"],
                sans: ["Lexend", "sans-serif"]
            }
        },
    },
    plugins: [],
}
