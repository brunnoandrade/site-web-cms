'use client'

import { useAllFormFields, useConfig, useDocumentInfo, useForm } from '@payloadcms/ui'
import { formatAdminURL } from 'payload/shared'
import React, { useEffect, useState } from 'react'

type FieldValue = unknown
const idOf = (value: FieldValue) =>
  value && typeof value === 'object' ? (value as { id?: number | string }).id : value

const DESCRIPTION_MAX = 160

/** Plain text of a Lexical tree. */
const text = (node: unknown): string => {
  if (!node || typeof node !== 'object') return ''
  const { text: own, children } = node as { text?: string; children?: unknown[] }
  return `${own ?? ''} ${Array.isArray(children) ? children.map(text).join(' ') : ''}`
}

const cut = (value: string) => {
  const flat = value.replace(/\s+/g, ' ').trim()
  return flat.length <= DESCRIPTION_MAX ? flat : `${flat.slice(0, DESCRIPTION_MAX - 1).trim()}…`
}

type Media = { url?: string; mimeType?: string; sizes?: { og?: { url?: string } } }

/**
 * Share preview (WhatsApp, LinkedIn, Facebook, X) of the SEO tab, with the image the website will
 * send: the plugin's own preview only shows the Google result. Mirrors the website's fallbacks
 * (`documentSeo` in src/utilities/seo.ts): SEO image, then featured/hero image; title and start of
 * the text when the SEO fields are empty.
 */
export const SharePreview: React.FC = () => {
  const {
    config: {
      routes: { api },
    },
  } = useConfig()
  const docInfo = useDocumentInfo()
  const { getData } = useForm()
  const [fields] = useAllFormFields()
  const value = (path: string) => fields[path]?.value

  const title = (value('meta.title') as string) || (value('title') as string) || ''
  const description =
    (value('meta.description') as string) ||
    (value('content') ? cut(text((value('content') as { root?: unknown }).root)) : '')
  const imageId =
    idOf(value('meta.image')) ?? idOf(value('heroImage')) ?? idOf(value('hero.media')) ?? null
  const fromFallback = !value('meta.image') && imageId !== null

  const [loaded, setLoaded] = useState<{ id: unknown; src: string } | null>(null)
  // Only the image of the current id counts; a stale one is ignored until the new one arrives.
  const src = loaded && loaded.id === imageId ? loaded.src : null
  const [host, setHost] = useState('')

  useEffect(() => {
    if (imageId === null || imageId === undefined) return
    let live = true
    const url = formatAdminURL({ apiRoute: api, path: `/media/${imageId}?depth=0` })
    fetch(url, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((media: Media | null) => {
        if (!live || !media?.url) return
        if (media.mimeType && !media.mimeType.startsWith('image/')) return
        setLoaded({ id: imageId, src: media.sizes?.og?.url || media.url })
      })
      .catch(() => {})
    return () => {
      live = false
    }
  }, [imageId, api])

  const collection = docInfo.collectionSlug
  const slug = value('slug')
  useEffect(() => {
    let live = true
    fetch(formatAdminURL({ apiRoute: api, path: '/plugin-seo/generate-url' }), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: docInfo.id, collectionSlug: collection, doc: getData() }),
    })
      .then((res) => res.json())
      .then(({ result }: { result?: string }) => {
        if (!live || !result) return
        try {
          setHost(new URL(result).host)
        } catch {
          setHost('')
        }
      })
      .catch(() => {})
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, collection, docInfo.id, slug])

  return (
    <div style={{ marginBottom: 20 }}>
      <div>Pré-visualização de compartilhamento</div>
      <div style={{ color: '#9A9A9A', marginBottom: 8 }}>
        Como o link aparece no WhatsApp, LinkedIn, Facebook e X.
      </div>
      <div
        style={{
          maxWidth: 520,
          overflow: 'hidden',
          borderRadius: 8,
          border: '1px solid var(--theme-elevation-150)',
          background: 'var(--theme-elevation-50)',
        }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt=""
            style={{ display: 'block', width: '100%', aspectRatio: '1.91 / 1', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              display: 'grid',
              placeItems: 'center',
              aspectRatio: '1.91 / 1',
              padding: 16,
              textAlign: 'center',
              color: '#9A9A9A',
              background: 'var(--theme-elevation-100)',
            }}
          >
            {imageId === null
              ? 'Sem imagem no documento: o site usará a imagem padrão da propriedade.'
              : 'Carregando imagem…'}
          </div>
        )}
        <div style={{ padding: '10px 12px' }}>
          {host && (
            <div style={{ fontSize: 12, color: '#9A9A9A', textTransform: 'uppercase' }}>{host}</div>
          )}
          <div style={{ fontWeight: 600 }}>{title || 'Sem título'}</div>
          {description && <div style={{ fontSize: 13, color: '#9A9A9A' }}>{description}</div>}
        </div>
      </div>
      {fromFallback && src && (
        <div style={{ color: '#9A9A9A', marginTop: 6, fontSize: 12 }}>
          Imagem tirada do destaque/hero do documento (campo de imagem SEO vazio).
        </div>
      )}
    </div>
  )
}
