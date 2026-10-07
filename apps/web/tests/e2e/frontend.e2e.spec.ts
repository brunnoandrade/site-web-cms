import { expect, test } from '@playwright/test'

/**
 * Main routes of the website, per tenant. Requires the CMS with the dev bootstrap content
 * (npm run -w cms bootstrap:dev) and the website on :3000.
 */

const DIGIO = 'http://localhost:3000'
const CAMPANHA = 'http://campanha.localhost:3000'

test.describe('website', () => {
  test('home of each tenant', async ({ page }) => {
    await page.goto(`${DIGIO}/`)
    await expect(page).toHaveTitle(/Digio/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')

    await page.goto(`${CAMPANHA}/`)
    await expect(page).toHaveTitle(/Campanha Exemplo/)
  })

  test('pages render the blocks', async ({ page }) => {
    await page.goto(`${DIGIO}/componentes/`)
    await expect(page.getByRole('table')).toBeVisible()
    await page.getByText('O cartão tem anuidade?').click()
    await expect(page.getByText('Não. O cartão não tem anuidade.')).toBeVisible()
  })

  test('adds the trailing slash in one hop, keeping the query string', async ({ request }) => {
    const res = await request.get(`${DIGIO}/componentes?utm_source=e2e`, { maxRedirects: 0 })
    expect(res.status()).toBe(308)
    // Same-site redirects use a relative Location.
    expect(new URL(res.headers().location!, DIGIO).toString()).toBe(
      `${DIGIO}/componentes/?utm_source=e2e`,
    )
  })

  test('unknown pages and hosts answer 404', async ({ request }) => {
    expect((await request.get(`${DIGIO}/nao-existe/`)).status()).toBe(404)
    expect((await request.get('http://desconhecido.localhost:3000/')).status()).toBe(404)
  })

  test('sitemaps and robots.txt per tenant', async ({ request }) => {
    const robots = await (await request.get(`${CAMPANHA}/robots.txt`)).text()
    expect(robots).toContain(`Sitemap: ${CAMPANHA}/pages-sitemap.xml`)
    expect(await (await request.get(`${DIGIO}/pages-sitemap.xml`)).text()).toContain(
      `${DIGIO}/componentes/`,
    )
  })

  test('blog keeps the WordPress URLs', async ({ page, request }) => {
    await page.goto(`${DIGIO}/blog/`)
    const firstPost = page.locator('article h3 a').first()
    const href = await firstPost.getAttribute('href')
    expect(href).toMatch(/^\/blog\/[^/]+\/[^/]+\/$/)

    await page.goto(`${DIGIO}${href}`)
    await expect(page.locator('h1')).toBeVisible()

    const [, category] = href!.split('/').filter(Boolean)
    expect((await request.get(`${DIGIO}/blog/${category}/`)).status()).toBe(200)

    // The same post under another category goes to its canonical URL.
    const slug = href!.split('/').filter(Boolean).pop()
    const wrong = await request.get(`${DIGIO}/blog/categoria-errada-${Date.now()}/${slug}/`, {
      maxRedirects: 0,
    })
    expect([404, 308]).toContain(wrong.status())

    expect((await request.get(`${DIGIO}/blog/page/999/`)).status()).toBe(404)
    expect((await request.get(`${DIGIO}/posts/`)).status()).toBe(404)
  })

  test('help center keeps the current URLs (/central-de-ajuda/<topico>/<pergunta>/)', async ({
    page,
    request,
  }) => {
    await page.goto(`${DIGIO}/central-de-ajuda/`)
    await expect(page.locator('h1')).toHaveText('Central de Ajuda')

    await page.getByRole('link', { name: /Cartão Digio/ }).click()
    await expect(page).toHaveURL(`${DIGIO}/central-de-ajuda/cartao-digio/`)

    await page.getByRole('link', { name: 'O cartão tem anuidade?' }).click()
    await expect(page).toHaveURL(`${DIGIO}/central-de-ajuda/cartao-digio/o-cartao-tem-anuidade/`)
    await expect(page.getByRole('navigation', { name: 'Trilha de navegação' })).toContainText(
      'Cartão Digio',
    )

    expect((await request.get(`${DIGIO}/central-de-ajuda/cartao-digio/nao-existe/`)).status()).toBe(
      404,
    )
  })
})
