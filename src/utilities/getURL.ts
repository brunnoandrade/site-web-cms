// The CMS (/admin and /api) and the website run in the same Next.js app, so by default every
// URL below is the same origin. The variables stay separate only to allow overriding one of them.

/** Public URL of this app (admin + API). */
export const getServerSideURL = () => process.env.SERVER_URL || 'http://localhost:3000'

/** Public URL of the website: used for previews, SEO URLs and CORS. */
export const getWebURL = () => process.env.WEB_URL || getServerSideURL()

/**
 * URL used to call the website's revalidation webhook server-to-server.
 * Defaults to WEB_URL; the app calls itself, so behind a proxy this can be http://localhost:<PORT>.
 */
export const getWebInternalURL = () => process.env.WEB_INTERNAL_URL || getWebURL()

/**
 * Public URL of the CMS as seen by the browser: admin bar, live preview and form submissions.
 * Server-side data is read through the Local API (see src/lib/cms.ts), without a URL.
 */
export const getCMSPublicURL = () => process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3000'
