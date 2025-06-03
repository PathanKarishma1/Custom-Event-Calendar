/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'pastel-blue': '#A8D8EA',
        'pastel-purple': '#AA96DA',
        'pastel-pink': '#FCBAD3',
        'pastel-yellow': '#FFFFD2',
      },
    },
  },
  plugins: [],
  safelist: [
    // Event colors
    'bg-blue-100', 'bg-blue-500', 'text-blue-800', 'border-blue-200',
    'bg-green-100', 'bg-green-500', 'text-green-800', 'border-green-200',
    'bg-purple-100', 'bg-purple-500', 'text-purple-800', 'border-purple-200',
    'bg-red-100', 'bg-red-500', 'text-red-800', 'border-red-200',
    'bg-yellow-100', 'bg-yellow-500', 'text-yellow-800', 'border-yellow-200',
    'bg-indigo-100', 'bg-indigo-500', 'text-indigo-800', 'border-indigo-200',
    // Opacity variations
    'bg-opacity-50', 'bg-opacity-80',
    // Background blur
    'backdrop-blur-sm',
    // Gradients
    'from-pink-100', 'via-purple-100', 'to-blue-100',
    'from-purple-500', 'to-pink-500',
    'from-pink-400', 'to-purple-400',
    'hover:from-pink-500', 'hover:to-purple-500'
  ]
};