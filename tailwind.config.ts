import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ueta: {
          red: '#E60023',
        },
        background: {
          light: '#FAFAFA',
          dark: '#1a1a1a',
        },
        card: {
          light: '#FFFFFF',
          dark: '#2a2a2a',
        },
        border: {
          light: '#EAEAEA',
          dark: '#404040',
        },
        text: {
          primary: {
            light: '#333333',
            dark: '#FFFFFF',
          },
          secondary: {
            light: '#666666',
            dark: '#A0A0A0',
          },
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
