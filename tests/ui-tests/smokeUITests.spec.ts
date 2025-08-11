import { test, expect } from '@playwright/test'
import { config } from '../../api-test.config'

test('Get Articles', async ({ page }) => {
    await page.goto('/')
    await page.getByText('Sign in').click()
    await page.getByRole('textbox', { name: 'Email' }).fill(config.userEmail)
    await page.getByRole('textbox', { name: 'Password' }).fill(config.userPassword)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByText('Your feed')).toBeVisible()
})