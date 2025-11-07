module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',  // If you have a pages directory
    './{app,components}/**/*.{js,ts,jsx,tsx}',  // More explicit catch-all
  ],
  safelist: [
    {
      pattern: /bg-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(100|200|300|400|500|600|700|800|900)/,
    },
    {
      pattern: /text-(xs|sm|base|lg|xl|2xl|3xl)/,
    },
    {
      pattern: /grid-cols-(2|3|4)/,
    }
  ]
}