declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /** CMS URL used by this server to read content (internal hostname in containers). */
      CMS_URL?: string
      /** CMS URL as seen by the browser (admin bar, live preview, form submissions). */
      NEXT_PUBLIC_CMS_URL?: string
      /** Public media storage URL (bucket or CDN), matching MEDIA_PUBLIC_URL on the CMS. */
      NEXT_PUBLIC_MEDIA_URL?: string
      IMAGES_ALLOW_LOCAL_IP?: string
      /** API key of a CMS service user; used only to read drafts in preview. */
      CMS_API_KEY?: string
      PREVIEW_SECRET: string
      REVALIDATE_SECRET: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
