import type { Field } from 'payload'

/**
 * Name of the document's property, read from the `tenant` relationship (virtual: not stored). The
 * multi-tenant plugin hides the `tenant` column once a property is selected, so the list of
 * Cabeçalho and Rodapé (one document per property) would show only dates; this is its title and
 * column. Out of the edit form: the property is already in the sidebar.
 */
export const tenantName: Field = {
  name: 'tenantName',
  label: 'Propriedade',
  type: 'text',
  virtual: 'tenant.name',
  admin: { condition: () => false },
}
