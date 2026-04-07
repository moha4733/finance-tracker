import { test, expect } from '@playwright/test'

test('shows field errors on register from API', async ({ page }) => {
  await page.route('**/api/auth/register', async (route) => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Valideringsfejl i input',
        fieldErrors: {
          username: 'Brugernavn er allerede taget',
          email: 'Email er allerede i brug',
          password: 'Kodeord skal vaere mindst 6 tegn'
        }
      })
    })
  })

  await page.goto('/register')
  await page.getByLabel('Brugernavn').fill('mo')
  await page.getByLabel('Email').fill('mo@test.com')
  await page.getByLabel('Kodeord').fill('123456')
  await page.getByRole('button', { name: 'Opret konto' }).click()

  await expect(page.getByText('Brugernavn er allerede taget').first()).toBeVisible()
  await expect(page.getByText('Email er allerede i brug').first()).toBeVisible()
  await expect(page.getByText('Kodeord skal vaere mindst 6 tegn').first()).toBeVisible()
})
