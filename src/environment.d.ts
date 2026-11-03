declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PAYLOAD_SECRET: string
      DATABASE_URL: string
      /** Public URL of this app (admin + API). */
      SERVER_URL?: string
      /** Only host that serves /admin and /auth (404 elsewhere). Empty: every host. */
      ADMIN_HOST?: string
      WEB_URL?: string
      WEB_INTERNAL_URL?: string
      NEXT_PUBLIC_WEB_URL?: string
      CRON_SECRET: string
      PREVIEW_SECRET: string
      REVALIDATE_SECRET: string
      S3_BUCKET: string
      S3_ACCESS_KEY_ID: string
      S3_SECRET_ACCESS_KEY: string
      S3_REGION: string
      S3_ENDPOINT?: string
      S3_FORCE_PATH_STYLE?: string
      MEDIA_PUBLIC_URL: string
      /** CMS URL as seen by the browser (admin bar, live preview, form submissions). */
      NEXT_PUBLIC_CMS_URL?: string
      /** Public media storage URL (bucket or CDN), matching MEDIA_PUBLIC_URL. */
      NEXT_PUBLIC_MEDIA_URL?: string
      IMAGES_ALLOW_LOCAL_IP?: string
      /** API key of a service user; used only to read drafts in preview. */
      CMS_API_KEY?: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
