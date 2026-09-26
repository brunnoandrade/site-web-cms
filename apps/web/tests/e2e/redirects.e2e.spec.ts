import { expect, test } from '@playwright/test'

/**
 * Redirects answered by the proxy. Creates a redirect through the CMS API and removes it at the
 * end. Requires E2E_LOCAL_EMAIL / E2E_LOCAL_PASSWORD of a super-admin (skipped when missing).
 */

const CMS = 'http://localhost:3001'
const SITE = 'http://localhost:3000'
const from = `/e2e-antiga-${Date.now()}/`

test.describe('redirects', () => {
  let token: string
  let redirectID: number | undefined

  test.beforeAll(async ({ request }) => {
    const email = process.env.E2E_LOCAL_EMAIL
    const password = process.env.E2E_LOCAL_PASSWORD
    test.skip(!email || !password, 'E2E_LOCAL_EMAIL / E2E_LOCAL_PASSWORD not set')

    const login = await request.post(`${CMS}/api/users/login`, {
      data: { email, password },
      headers: { 'Sec-Fetch-Site': 'same-origin' },
    })
    token = (await login.json()).token

    const tenants = await (await request.get(`${CMS}/api/tenants?where[slug][equals]=digio`)).json()
    const created = await request.post(`${CMS}/api/redirects`, {
      headers: { Authorization: `JWT ${token}` },
      data: { tenant: tenants.docs[0].id, from, to: { type: 'custom', url: '/componentes/' } },
    })
    expect(created.ok()).toBe(true)
    redirectID = (await created.json()).doc.id
  })

  test.afterAll(async ({ request }) => {
    if (redirectID) {
      await request.delete(`${CMS}/api/redirects/${redirectID}`, {
        headers: { Authorization: `JWT ${token}` },
      })
    }
  })

  test('301 keeps utm_*, gclid and fbclid, in one hop, right after saving', async ({ request }) => {
    const query = '?utm_source=google&utm_campaign=verao&gclid=abc&fbclid=xyz'
    const res = await request.get(`${SITE}${from.slice(0, -1)}${query}`, { maxRedirects: 0 })
    expect(res.status()).toBe(301)
    // Same-site redirects use a relative Location.
    const location = new URL(res.headers().location!, SITE).toString()
    expect(location).toBe(`${SITE}/componentes/${query}`)

    const final = await request.get(location, { maxRedirects: 0 })
    expect(final.status()).toBe(200)
  })

  test('a browser lands on the destination', async ({ page }) => {
    await page.goto(`${SITE}${from}?utm_source=e2e`)
    await expect(page).toHaveURL(`${SITE}/componentes/?utm_source=e2e`)
  })
})
