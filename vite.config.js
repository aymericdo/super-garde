import { sveltekit } from '@sveltejs/kit/vite'

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit()],
  // define: {
  //   'process.env.NODE_ENV': JSON.stringify('production')
  // }
}

export default config
