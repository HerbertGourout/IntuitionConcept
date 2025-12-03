/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // Polices principales
        primary: ['Outfit', 'sans-serif'],
        secondary: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        heading: ['Outfit', 'sans-serif'],
        // Polices BTP Africa - accents visuels
        display: ['Bebas Neue', 'sans-serif'],  // Titres impact, stats
        handwritten: ['Caveat', 'cursive'],      // Annotations manuscrites
      },
      colors: {
        // Gradients as CSS variables
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-secondary': 'var(--gradient-secondary)',
        'gradient-accent': 'var(--gradient-accent)',
        'gradient-neutral': 'var(--gradient-neutral)',
        
        // Solid colors for fallback
        primary: {
          50: '#F3E8FF',
          100: '#E9D5FF',
          200: '#D8B4FE',
          300: '#C084FC',
          400: '#A855F7',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        secondary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        accent: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
        'gradient-primary-hover': 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
        'gradient-secondary-hover': 'linear-gradient(135deg, #2563EB 0%, #0891B2 100%)',
        'gradient-accent': 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
        'gradient-accent-hover': 'linear-gradient(135deg, #D97706 0%, #DC2626 100%)',
        'gradient-neutral': 'linear-gradient(135deg, #6B7280 0%, #374151 100%)',
        'gradient-animated': 'linear-gradient(-45deg, #8B5CF6, #EC4899, #3B82F6, #06B6D4)',
        'gradient-success': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        'gradient-warning': 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        'gradient-error': 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(139, 92, 246, 0.4)',
        'glow-lg': '0 0 30px rgba(139, 92, 246, 0.6)',
        'primary': '0 10px 25px -3px rgba(139, 92, 246, 0.3), 0 4px 6px -2px rgba(139, 92, 246, 0.1)',
        'secondary': '0 10px 25px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -2px rgba(59, 130, 246, 0.1)',
        'accent': '0 10px 25px -3px rgba(245, 158, 11, 0.3), 0 4px 6px -2px rgba(245, 158, 11, 0.1)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'gradient': 'gradientShift 15s ease infinite',
        'gradient-fast': 'gradientShift 8s ease infinite',
        'glow': 'glow 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'morph': 'morph 8s ease-in-out infinite',
        'slide-in-up': 'slideInUp 0.3s ease-out',
        'slide-in-down': 'slideInDown 0.3s ease-out',
        'fade-in-scale': 'fadeInScale 0.3s ease-out',
      },
      keyframes: {
        gradientShift: {
          '0%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 50%' },
        },
        glow: {
          '0%, 100%': { 
            'box-shadow': '0 0 20px rgba(139, 92, 246, 0.4)',
            'filter': 'brightness(1)'
          },
          '50%': { 
            'box-shadow': '0 0 30px rgba(139, 92, 246, 0.6)',
            'filter': 'brightness(1.1)'
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        morph: {
          '0%': { 'border-radius': '1rem' },
          '25%': { 'border-radius': '1.5rem 0.75rem 1rem 2rem' },
          '50%': { 'border-radius': '0.75rem' },
          '75%': { 'border-radius': '2rem 1rem 1.5rem 0.75rem' },
          '100%': { 'border-radius': '1rem' },
        },
        slideInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideInDown: {
          '0%': {
            opacity: '0',
            transform: 'translateY(-30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        fadeInScale: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.8)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
      },
    },
  },
  plugins: [],
};
