module.exports = {
  purge: ["./pages/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        blue: {
          twitter: "#1da1f2",
        },
        red: {
          twitch: "#e91916",
          youtube: "#ff0000",
        },
        purple: {
          twitch: "#9146ff",
        },
        gray: {
          github: "#333333",
        },
      },
      fontFamily: {
        heading: ["Sora", "sans-serif"],
        body: ["Source Sans Pro", "sans-serif"],
      },
      gridTemplateColumns: {
        layout: "2fr 4fr",
        layoutWide: "1fr 5fr",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
