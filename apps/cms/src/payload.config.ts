import { postgresAdapter } from '@payloadcms/db-postgres'
import { en } from '@payloadcms/translations/languages/en'
import { pt } from '@payloadcms/translations/languages/pt'
import { s3Storage } from '@payloadcms/storage-s3'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Authors } from './collections/Authors'
import { Banners } from './collections/Banners'
import { Faqs } from './collections/Faqs'
import { HelpCategories } from './collections/HelpCategories'
import { HelpTopics } from './collections/HelpTopics'
import { Products } from './collections/Products'
import { Rates } from './collections/Rates'
import { Tenants } from './collections/Tenants'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL, getWebURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    // Light and dark are available; light is the default (see src/proxy.ts).
    theme: 'all',
    components: {
      // "Entrar com SSO" below the local login form (see src/auth).
      afterLogin: ['@/components/SsoLogin'],
      // Local and SSO accounts have separate logouts.
      logout: {
        Button: '@/components/LogoutButton',
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  // Admin UI in Portuguese (default, see src/proxy.ts) or English, chosen in the user's account.
  i18n: {
    fallbackLanguage: 'pt',
    supportedLanguages: { pt, en },
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  collections: [
    Pages,
    Posts,
    Categories,
    Authors,
    Media,
    Products,
    Rates,
    Faqs,
    HelpCategories,
    HelpTopics,
    Banners,
    Header,
    Footer,
    Tenants,
    Users,
  ],
  serverURL: getServerSideURL(),
  // The website (apps/web) runs on another origin: it embeds live preview, reads the REST API
  // and shows the admin bar with the editor's session cookie.
  cors: [getServerSideURL(), getWebURL()],
  csrf: [getServerSideURL(), getWebURL()],
  plugins: [
    ...plugins,
    // Media files live in S3-compatible storage (MinIO locally, CDN in higher environments).
    // Files are served straight from MEDIA_PUBLIC_URL instead of through this CMS, so the
    // website keeps showing images even when the CMS is down. Media is public by design.
    s3Storage({
      collections: {
        media: {
          // Each file goes under tenants/<tenant-slug>/ (set by the setTenantPrefix hook).
          prefix: 'tenants',
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) =>
            [process.env.MEDIA_PUBLIC_URL, prefix, filename].filter(Boolean).join('/'),
        },
      },
      bucket: process.env.S3_BUCKET,
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        },
        region: process.env.S3_REGION,
        endpoint: process.env.S3_ENDPOINT || undefined,
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
      },
    }),
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    // Shared with apps/web through the @digio/payload-types workspace package.
    outputFile: path.resolve(dirname, '../../../packages/payload-types/src/payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})
