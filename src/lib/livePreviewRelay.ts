/**
 * `requestHandler` of `useLivePreview`: goes through the site itself
 * (app/(frontend)/next/live-preview/route.ts), not the CMS, which is on another origin than the
 * tenant's site and does not allow it by CORS. The hook asks for `<collection>/<id>`.
 */
export const relayRequest = ({
  data,
  endpoint,
}: {
  data: Record<string, unknown>
  endpoint: string
}) => {
  const [collection, id] = endpoint.split('/')
  return fetch('/next/live-preview/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, collection, id }),
  })
}
