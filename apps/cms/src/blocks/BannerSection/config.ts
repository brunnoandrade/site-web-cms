import type { Block } from 'payload'

import { t } from '../../utilities/labels'

// Not "banner": that slug is the inline banner block of the rich text editor.
export const BannerSection: Block = {
  slug: 'bannerSection',
  interfaceName: 'BannerSectionBlock',
  labels: { singular: t('Banner', 'Banner'), plural: t('Banners', 'Banners') },
  fields: [
    {
      name: 'banner',
      label: t('Banner', 'Banner'),
      type: 'relationship',
      relationTo: 'banners',
      required: true,
      admin: {
        description: t(
          'Só aparece no site se estiver ativo e dentro do período de exibição.',
          'Only shown on the website when active and within its display period.',
        ),
      },
    },
  ],
}
