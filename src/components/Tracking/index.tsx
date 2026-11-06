'use client'

import React, { useEffect, useSyncExternalStore } from 'react'

import { Button } from '@/components/ui/button'

type Props = {
  tenant: string
  gtmId?: string | null
  ga4Id?: string | null
  /** Ask for consent before tracking (Consent Mode v2 starts denied). */
  consentBanner?: boolean | null
  privacyUrl?: string | null
}

type Choice = 'granted' | 'denied'

declare global {
  interface Window {
    dataLayer?: unknown[]
  }
}

const texts = {
  message: 'Usamos cookies para medir o uso do site e melhorar a sua experiência.',
  privacy: 'Política de privacidade',
  accept: 'Aceitar',
  refuse: 'Recusar',
  label: 'Aviso de cookies',
} as const

/**
 * Local and test hosts do not send hits: the property's real GTM/GA4 would receive the traffic of
 * development. `NEXT_PUBLIC_TRACKING_ON_LOCALHOST=true` turns it on to test the tags.
 */
const isLocalHost = () =>
  process.env.NEXT_PUBLIC_TRACKING_ON_LOCALHOST !== 'true' &&
  /^(localhost|127\.0\.0\.1|\[::1\]|.*\.localhost)$/.test(window.location.hostname)

const storageKey = (tenant: string) => `consent:${tenant}`

const CHANGE_EVENT = 'consent-change'

const subscribe = (notify: () => void) => {
  window.addEventListener('storage', notify)
  window.addEventListener(CHANGE_EVENT, notify)
  return () => {
    window.removeEventListener('storage', notify)
    window.removeEventListener(CHANGE_EVENT, notify)
  }
}

const readChoice = (tenant: string): Choice | null => {
  try {
    const value = window.localStorage.getItem(storageKey(tenant))
    return value === 'granted' || value === 'denied' ? value : null
  } catch {
    return null
  }
}

/** Pushes to the data layer the way gtag.js does (it expects `arguments` objects, not arrays). */
function gtag(..._args: unknown[]) {
  // eslint-disable-next-line prefer-rest-params
  ;(window.dataLayer ??= []).push(arguments)
}

const setConsent = (state: Choice) =>
  gtag('consent', 'update', {
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
    analytics_storage: state,
  })

const loadScript = (src: string) => {
  const script = document.createElement('script')
  script.async = true
  script.src = src
  document.head.appendChild(script)
}

/**
 * Analytics of the property (GTM, or GA4 alone) plus the optional consent banner (LGPD).
 * Loaded when the browser is idle, not during startup, so it does not weigh on the page load
 * (docs/desempenho.md). Without a GTM or GA4 ID nothing is loaded.
 */
export const Tracking: React.FC<Props> = ({ tenant, gtmId, ga4Id, consentBanner, privacyUrl }) => {
  const enabled = Boolean(gtmId || ga4Id)
  // The server snapshot says "already chosen", so the banner never shows in the server HTML.
  const stored = useSyncExternalStore(
    subscribe,
    () => readChoice(tenant),
    () => 'granted' as Choice | null,
  )

  useEffect(() => {
    if (!enabled || isLocalHost()) return
    const choice = consentBanner ? readChoice(tenant) : 'granted'

    window.dataLayer ??= []
    if (consentBanner) {
      const state = choice ?? 'denied'
      gtag('consent', 'default', {
        ad_storage: state,
        ad_user_data: state,
        ad_personalization: state,
        analytics_storage: state,
        wait_for_update: 500,
      })
    }

    const start = () => {
      if (gtmId) {
        gtag('js', new Date())
        window.dataLayer?.push({ event: 'gtm.js', 'gtm.start': Date.now() })
        loadScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`)
      } else if (ga4Id) {
        gtag('js', new Date())
        gtag('config', ga4Id)
        loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`)
      }
    }
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 2000))
    const handle = idle(start, { timeout: 4000 } as IdleRequestOptions)
    return () => {
      if (window.cancelIdleCallback && typeof handle === 'number') window.cancelIdleCallback(handle)
    }
  }, [enabled, tenant, gtmId, ga4Id, consentBanner])

  if (!enabled || !consentBanner || stored !== null) return null

  const choose = (choice: Choice) => {
    try {
      window.localStorage.setItem(storageKey(tenant), choice)
    } catch {
      // Without storage the choice only lasts until the page is reloaded.
    }
    setConsent(choice)
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }

  return (
    <section
      aria-label={texts.label}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background p-4 shadow-lg"
    >
      <div className="container flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm">
          {texts.message}{' '}
          {privacyUrl && (
            <a className="underline" href={privacyUrl}>
              {texts.privacy}
            </a>
          )}
        </p>
        <div className="flex gap-2">
          <Button onClick={() => choose('denied')} size="sm" variant="outline">
            {texts.refuse}
          </Button>
          <Button onClick={() => choose('granted')} size="sm">
            {texts.accept}
          </Button>
        </div>
      </div>
    </section>
  )
}
