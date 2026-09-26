/** Public URL of this CMS (admin + API). */
export const getServerSideURL = () => process.env.SERVER_URL || 'http://localhost:3001'

/** Public URL of the website (apps/web): used for previews, SEO URLs and CORS. */
export const getWebURL = () => process.env.WEB_URL || 'http://localhost:3000'

/**
 * URL the CMS uses to call the website server-to-server (revalidation webhook).
 * In containers this is the internal hostname (e.g. http://web:3000); defaults to WEB_URL.
 */
export const getWebInternalURL = () => process.env.WEB_INTERNAL_URL || getWebURL()
