import type { Block, Field } from 'payload'

import { t } from '../utilities/labels'

/** Same format the browser accepts in a `#fragment` without encoding; also keeps editors honest. */
const ANCHOR_PATTERN = /^[a-z][a-z0-9-]*$/

export const anchorField: Field = {
  name: 'anchor',
  label: t('Âncora (opcional)', 'Anchor (optional)'),
  type: 'text',
  admin: {
    description: t(
      'Identificador para links dentro da página. Ex.: "solucoes": um link para #solucoes leva até esta seção. Só letras minúsculas, números e hífen.',
      'Identifier for in-page links. E.g. "solutions": a link to #solutions scrolls to this section. Lowercase letters, numbers and hyphens only.',
    ),
  },
  validate: (value: unknown) =>
    !value || (typeof value === 'string' && ANCHOR_PATTERN.test(value))
      ? true
      : 'Use só letras minúsculas, números e hífen, começando por uma letra.',
}

/** Adds the anchor field at the end of a block, so every section of a page can be linked to. */
export const withAnchor = (block: Block): Block => ({
  ...block,
  fields: [...block.fields, anchorField],
})
