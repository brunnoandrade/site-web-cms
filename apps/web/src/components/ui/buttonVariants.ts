import { cva } from 'class-variance-authority'

// Separate from button.tsx ('use client') so server components can use the classes too.
// Digio design system: pill buttons (Uber Conta pattern) in Digio colors.
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /** Navy on light backgrounds. */
        default: 'bg-navy-900 text-white hover:bg-navy-700',
        /** White on dark backgrounds (navy, blue). */
        inverse: 'bg-white text-navy-900 hover:bg-lilac-100',
        /** Turquoise highlight (e.g. "Abrir conta" on the navy header). */
        accent: 'bg-turquoise-400 text-navy-900 hover:bg-turquoise-300',
        secondary: 'bg-lilac-100 text-navy-900 hover:bg-[#dde1f3]',
        /** Takes the text color of the section (works on light and dark). */
        outline: 'border-2 border-current bg-transparent hover:bg-current/10',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        ghost: 'hover:bg-current/10',
        link: 'text-brand-blue underline-offset-4 hover:underline',
      },
      size: {
        clear: '',
        default: 'h-11 px-6 text-sm',
        sm: 'h-9 px-4 text-sm',
        lg: 'h-14 px-8 text-base',
        icon: 'size-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)
