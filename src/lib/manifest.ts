import type { Tenant } from '@/lib/cms'
import { localeOf } from '@/lib/helpStyle'
import { themeColorOf } from '@/lib/themes'
import { getMediaUrl } from '@/utilities/getMediaUrl'

/** Web app manifest of a property (/manifest.webmanifest): name, colors and the app icon. */
export const webManifest = (
  tenant: Pick<
    Tenant,
    | 'name'
    | 'siteUrl'
    | 'manifestIcon'
    | 'themeColor'
    | 'locale'
    | 'appIcon'
    | 'seoDefaultDescription'
  >,
) => {
  const icon = tenant.appIcon
  // The platform's generic icon is only a last resort: not listed beside an icon of the property.
  const ownAppIcon =
    icon && typeof icon === 'object' && icon.url ? getMediaUrl(icon.url) : undefined
  const install = tenant.manifestIcon
  const installIcon =
    install && typeof install === 'object' && install.url ? getMediaUrl(install.url) : undefined
  const appIcon = ownAppIcon ?? (installIcon ? undefined : '/icons/apple-touch-icon.png')
  return {
    name: tenant.name,
    short_name: tenant.name,
    description: tenant.seoDefaultDescription || undefined,
    start_url: '/',
    scope: '/',
    display: 'browser' as const,
    background_color: '#ffffff',
    theme_color: themeColorOf(tenant) ?? '#ffffff',
    lang: localeOf(tenant),
    icons: [
      ...(appIcon
        ? [{ src: appIcon, sizes: '180x180', type: 'image/png', purpose: 'any' as const }]
        : []),
      // One 512 px file serves as the 192 and the 512 icons browsers require to offer installation.
      ...(installIcon
        ? [
            {
              src: installIcon,
              sizes: '192x192 512x512',
              type: 'image/png',
              purpose: 'any' as const,
            },
          ]
        : []),
    ],
  }
}
