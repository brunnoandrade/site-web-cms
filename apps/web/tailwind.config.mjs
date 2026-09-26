/** @type {import('tailwindcss').Config} */
const config = {
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: [
            {
              // Rich text takes the color of its section (light or dark backgrounds).
              '--tw-prose-body': 'currentColor',
              '--tw-prose-headings': 'currentColor',
              '--tw-prose-bold': 'currentColor',
              '--tw-prose-links': 'currentColor',
              '--tw-prose-bullets': 'currentColor',
              '--tw-prose-counters': 'currentColor',
              '--tw-prose-quotes': 'currentColor',
              '--tw-prose-th-borders': 'currentColor',
              maxWidth: 'none',
              h1: {
                fontWeight: 'normal',
                marginBottom: '0.25em',
              },
            },
          ],
        },
        base: {
          css: [
            {
              h1: {
                fontSize: '2.5rem',
              },
              h2: {
                fontSize: '1.25rem',
                fontWeight: 600,
              },
            },
          ],
        },
        md: {
          css: [
            {
              h1: {
                fontSize: '3.5rem',
              },
              h2: {
                fontSize: '1.5rem',
              },
            },
          ],
        },
      },
    },
  },
}

export default config
