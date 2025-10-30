import type { Config } from "tailwindcss";

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
        primary: {
          50: '#f7f8f8',
          100: '#e6e7e8',
          200: '#d0d6e0',
          300: '#8a8f98',
          400: '#62666d',
          500: '#38383a',
          600: '#2a2a2c',
          700: '#1c1c1f',
          800: '#141516',
          900: '#08090a',
          950: '#0f1011'
        },
        accent: {
          50: '#f0f0ff',
          100: '#e6e6ff',
          200: '#d0d0ff',
          300: '#b3b3ff',
          400: '#9999ff',
          500: '#5e6ad2',
          600: '#4c57b8',
          700: '#3d469e',
          800: '#2d3585',
          900: '#1f256b'
        },
        success: '#68cc58',
        warning: '#f2c94c',
        error: '#eb5757',
        info: '#4ea7fc',
        background: {
          primary: '#08090a',
          secondary: '#0f1011',
          tertiary: '#141516',
          quaternary: '#1c1c1f',
        },
        text: {
          primary: '#f7f8f8',
          secondary: '#d0d6e0',
          tertiary: '#8a8f98',
          quaternary: '#62666d',
        },
        border: {
          primary: '#23252a',
          secondary: '#34343a',
          tertiary: '#3e3e44',
        }
      },
      fontFamily: {
        sans: ['"Inter Variable"', '"SF Pro Display"', '-apple-system', 'system-ui', '"Segoe UI"', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', '"Open Sans"', '"Helvetica Neue"', 'sans-serif'],
        mono: ['"Berkeley Mono"', 'ui-monospace', '"SF Mono"', 'Menlo', 'monospace']
      },
      fontSize: {
        'xs': '0.6875rem',
        'sm': '0.75rem',
        'base': '0.875rem',
        'md': '0.9375rem',
        'lg': '1.0625rem',
        'xl': '1.3125rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
        '5xl': '3rem',
        '6xl': '3.5rem',
        '7xl': '4rem',
        '8xl': '4.5rem'
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '510',
        semibold: '590',
        bold: '680'
      },
      lineHeight: {
        tight: '1.1',
        snug: '1.33',
        normal: '1.4',
        relaxed: '1.5',
        loose: '1.6'
      },
      letterSpacing: {
        tighter: '-0.022em',
        tight: '-0.015em',
        normal: '-0.012em',
        wide: '-0.01em'
      },
      borderRadius: {
        'none': '0px',
        'sm': '4px',
        'DEFAULT': '6px',
        'md': '8px',
        'lg': '10px',
        'xl': '16px',
        '2xl': '18px',
        '3xl': '24px',
        '4xl': '30px',
        'full': '9999px'
      },
      boxShadow: {
        'none': '0px 0px 0px transparent',
        'sm': '0px 2px 4px rgba(0, 0, 0, 0.1)',
        'md': '0px 4px 24px rgba(0, 0, 0, 0.2)',
        'lg': '0px 7px 32px rgba(0, 0, 0, 0.35)',
        'stack': 'rgba(0, 0, 0, 0) 0px 8px 2px 0px, rgba(0, 0, 0, 0.01) 0px 5px 2px 0px, rgba(0, 0, 0, 0.04) 0px 3px 2px 0px, rgba(0, 0, 0, 0.07) 0px 1px 1px 0px, rgba(0, 0, 0, 0.08) 0px 0px 1px 0px',
        'inset': 'rgba(255, 255, 255, 0.04) 0px 1.503px 5.261px 0px inset, rgba(255, 255, 255, 0.1) 0px -0.752px 0.752px 0px inset'
      },
      backdropBlur: {
        'header': '20px'
      },
      zIndex: {
        'overlay': '500',
        'popover': '600',
        'dialog': '700',
        'toast': '800',
        'tooltip': '1100',
        'max': '10000'
      },
      transitionDuration: {
        'fast': '100ms',
        'normal': '250ms',
        'slow': '500ms'
      },
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'ease-in': 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
        'ease-in-out': 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
        'bouncy': 'cubic-bezier(0.77, 0, 0.175, 1)'
      },
      maxWidth: {
        'prose': '624px',
        'container': '1024px'
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem'
      }
    },
  },
  plugins: [],
};

export default config;
