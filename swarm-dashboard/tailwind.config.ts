import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        lcars: {
          orange: "#FF9900",
          gold: "#FFCC66",
          blue: "#9999FF",
          purple: "#CC99CC",
          red: "#CC6666",
          cyan: "#99CCFF",
          bg: "#000000",
          panel: "#1a1a2e",
          "panel-light": "#16213e",
          green: "#66FF66",
          amber: "#FFCC00",
        },
      },
      fontFamily: {
        lcars: ['"Antonio"', '"Helvetica Neue"', "Arial", "sans-serif"],
      },
      animation: {
        pulse_slow: "pulse 3s ease-in-out infinite",
        scan: "scan 2s linear infinite",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px currentColor" },
          "100%": { boxShadow: "0 0 20px currentColor, 0 0 40px currentColor" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
