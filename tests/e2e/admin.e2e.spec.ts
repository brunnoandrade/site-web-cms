import { test, expect, Page } from '@playwright/test'
import { login } from '../helpers/login'
import { seedTestUser, cleanupTestUser, deletePage, testUser } from '../helpers/seedUser'

test.describe('Admin Panel', () => {
  let page: Page
  // Opening "create" stores a blank draft page (autosave): remember it to remove it afterwards.
  const createdPages: string[] = []

  test.beforeAll(async ({ browser }) => {
    await seedTestUser()

    const context = await browser.newContext()
    page = await context.newPage()

    await login({ page, user: testUser })
  })

  test.afterAll(async () => {
    for (const id of createdPages) await deletePage(id)
    await cleanupTestUser()
  })

  test('can navigate to dashboard', async () => {
    await page.goto('http://localhost:3000/admin')
    await expect(page).toHaveURL('http://localhost:3000/admin')
    // Admin defaults to Portuguese (src/proxy.ts).
    const dashboardArtifact = page.getByText('Painel de Controle').first()
    await expect(dashboardArtifact).toBeVisible()
  })

  test('can navigate to list view', async () => {
    await page.goto('http://localhost:3000/admin/collections/users')
    await expect(page).toHaveURL('http://localhost:3000/admin/collections/users')
    const listViewArtifact = page.locator('h1', { hasText: 'Usuários' }).first()
    await expect(listViewArtifact).toBeVisible()
  })

  test('can navigate to edit view', async () => {
    await page.goto('http://localhost:3000/admin/collections/pages/create')
    await expect(page).toHaveURL(/\/admin\/collections\/pages\/[a-zA-Z0-9-_]+/)
    createdPages.push(page.url().split('/').pop()!.split('?')[0]!)
    const editViewArtifact = page.locator('input[name="title"]')
    await expect(editViewArtifact).toBeVisible()
  })
})
