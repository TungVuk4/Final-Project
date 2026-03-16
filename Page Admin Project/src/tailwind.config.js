/** @type {import('tailwindcss').Config} */
export default {
  // QUAN TRỌNG NHẤT: Thêm dòng này để web CHỈ ĐEN khi có class .dark
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
