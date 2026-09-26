declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PAYLOAD_SECRET: string
      DATABASE_URL: string
      SERVER_URL?: string
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
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
