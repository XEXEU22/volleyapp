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
                primary: "#FF3B3B", // Vibrant Red
                "background-light": "#f6f8f7",
                "background-dark": "#000000", // Pure Black
                "card-dark": "#0F0F0F", // Deep charcoal for cards
                "accent-orange": "#FF8C42"
            },
            fontFamily: {
                display: ["Lexend", "sans-serif"],
                sans: ["Lexend", "sans-serif"]
            }
        },
    },
    plugins: [],
}
