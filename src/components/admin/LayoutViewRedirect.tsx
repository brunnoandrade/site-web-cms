import { GlobalViewRedirect } from '@payloadcms/plugin-multi-tenant/rsc'

type Args = Parameters<typeof GlobalViewRedirect>[0]

/**
 * Replaces the multi-tenant plugin's redirect for Cabeçalho and Rodapé. The plugin sends the list
 * view straight to the selected property's document; here the list stays (see LayoutList) and only
 * the document and create views keep the plugin's check (the document must match the selected
 * property).
 */
export const LayoutViewRedirect = async (args: Args) => {
  if (args?.viewType === 'list') return null
  return GlobalViewRedirect(args)
}
