import type { Field } from 'payload'

import { t } from '../utilities/labels'

/**
 * ID of the document in the current WordPress. Set by scripts/migrate-wordpress.ts to make
 * the migration idempotent (re-running updates instead of duplicating). Read-only in the admin.
 */
export const wpIdField: Field = {
  name: 'wpId',
  label: t('ID no WordPress', 'WordPress ID'),
  type: 'number',
  index: true,
  admin: {
    position: 'sidebar',
    readOnly: true,
    condition: (data) => Boolean(data?.wpId),
  },
  access: {
    create: () => false,
    update: () => false,
  },
}
