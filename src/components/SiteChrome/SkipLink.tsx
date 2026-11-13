import React from 'react'

/** WCAG 2.4.1: lets keyboard users skip the navigation. */
export const SkipLink: React.FC = () => (
  <a
    className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-navy-900"
    href="#conteudo"
  >
    Pular para o conteúdo
  </a>
)
