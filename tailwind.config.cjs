import daisyui from 'daisyui';
import typography from '@tailwindcss/typography';
import forms from '@tailwindcss/forms';

const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  plugins: [
    forms,
    typography,
    daisyui,
  ],
  daisyui: {
    themes: [
      "garden",
    ],
  },
}

module.exports = config
