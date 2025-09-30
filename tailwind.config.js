import daisyui from 'daisyui'
import typography from '@tailwindcss/typography'
import forms from '@tailwindcss/forms'

/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  plugins: [
    forms,
    typography,
    daisyui,
  ],
  daisyui: {
    themes: [
      'garden',
    ],
    logs: false,
  },
  safelist: [
    'bg-[#be3144]',
    'bg-[#ee7214]',
    'bg-[#ff00bf]',
    'bg-[#62ff00]',
  ],
}

export default config
