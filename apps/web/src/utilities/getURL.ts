/**
 * Public URL of the CMS (apps/cms), as seen by the browser: admin bar, live preview and
 * form submissions. Server-side data fetching uses CMS_URL instead (see src/lib/cms.ts).
 */
export const getCMSPublicURL = () => process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3001'
