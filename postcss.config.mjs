import unwrapLayer from './postcss-unwrap-layer.mjs';

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: [
    '@tailwindcss/postcss',
    unwrapLayer,
  ],
}

export default config
