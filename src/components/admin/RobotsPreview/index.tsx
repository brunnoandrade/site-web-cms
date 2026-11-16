'use client'

import { useAllFormFields } from '@payloadcms/ui'
import React from 'react'

import { robotsTxt } from '@/lib/robots'

/**
 * Read-only preview of the property's /robots.txt, built from the form as it is being edited with
 * the same function the website uses (src/lib/robots.ts), so what shows here is what is served
 * after saving.
 */
export const RobotsPreview: React.FC = () => {
  const [fields] = useAllFormFields()
  const text = robotsTxt({
    siteUrl: ((fields.siteUrl?.value as string) || '').replace(/\/+$/, ''),
    blockIndexing: Boolean(fields.blockIndexing?.value),
    blockAiCrawlers: Boolean(fields.blockAiCrawlers?.value),
    robotsExtra: (fields.robotsExtra?.value as string) || '',
  })

  return (
    <div style={{ marginBottom: 20 }}>
      <div>Pré-visualização do robots.txt</div>
      <div style={{ color: '#9A9A9A', marginBottom: 8 }}>
        Como o arquivo ficará depois de salvar, com as opções acima. Só leitura.
      </div>
      <pre
        style={{
          margin: 0,
          maxHeight: 360,
          overflow: 'auto',
          padding: 'var(--base)',
          borderRadius: 'var(--style-radius-s, 4px)',
          background: 'var(--theme-elevation-50)',
          border: '1px solid var(--theme-elevation-150)',
          fontSize: 13,
          lineHeight: 1.5,
        }}
      >
        {text}
      </pre>
    </div>
  )
}
