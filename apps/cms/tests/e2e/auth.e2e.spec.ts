import { expect, test, type Page } from '@playwright/test'

/**
 * Admin authentication with both authenticators, in a real browser.
 * Requires: docker compose up -d (Postgres, MinIO, Keycloak) and the CMS on :3001.
 * Local account: E2E_LOCAL_EMAIL / E2E_LOCAL_PASSWORD (skipped when missing).
 */

const CMS = 'http://localhost:3001'
const SSO_PASSWORD = 'Senha-123'
const shots = process.env.E2E_SCREENSHOTS_DIR

const screenshot = async (page: Page, name: string) => {
  if (shots) await page.screenshot({ path: `${shots}/${name}.png`, fullPage: true })
}

async function loginWithSso(page: Page, username: string) {
  await page.goto(`${CMS}/admin/login`)
  await page.getByRole('link', { name: 'Entrar com SSO corporativo' }).click()
  await page.waitForURL(/\/realms\/digio\//)
  await screenshot(page, `keycloak-${username}`)
  await page.locator('#username').fill(username)
  await page.locator('#password').fill(SSO_PASSWORD)
  await page.locator('#kc-login').click()
}

// Wide viewport: the admin nav (with the logout button) is open.
test.use({ viewport: { width: 1600, height: 1000 } })

test.describe('admin login', () => {
  test('login page offers local login and SSO', async ({ page }) => {
    await page.goto(`${CMS}/admin/login`)
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Entrar com SSO corporativo' })).toBeVisible()
    await screenshot(page, 'login-page')
  })

  test('SSO login and SSO logout (also ends the RH-SSO session)', async ({ page }) => {
    await loginWithSso(page, 'sso.editor')
    await page.waitForURL(`${CMS}/admin`)
    await expect(page.locator('.nav__log-out')).toBeVisible()
    await screenshot(page, 'sso-dashboard')

    await page.locator('.nav__log-out').click()
    await page.waitForURL(/\/admin\/login/)
    await screenshot(page, 'sso-after-logout')

    // Keycloak session ended: SSO asks for the password again.
    await page.getByRole('link', { name: 'Entrar com SSO corporativo' }).click()
    await expect(page.locator('#username')).toBeVisible()
  })

  test('SSO user without access sees an explanation', async ({ page }) => {
    await loginWithSso(page, 'sso.semacesso')
    await page.waitForURL(/sso_error=no_access/)
    await expect(page.locator('.sso-login__error')).toContainText('não tem acesso')
    await screenshot(page, 'sso-no-access')
  })

  test('local login and local logout', async ({ page }) => {
    const email = process.env.E2E_LOCAL_EMAIL
    const password = process.env.E2E_LOCAL_PASSWORD
    test.skip(!email || !password, 'E2E_LOCAL_EMAIL / E2E_LOCAL_PASSWORD not set')

    await page.goto(`${CMS}/admin/login`)
    await page.locator('#field-email').fill(email!)
    await page.locator('#field-password').fill(password!)
    await page.locator('button[type="submit"]').click()
    await page.waitForURL(`${CMS}/admin`)
    await screenshot(page, 'local-dashboard')

    await page.locator('.nav__log-out').click()
    await page.waitForURL(/\/admin\/login/)
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })
})
