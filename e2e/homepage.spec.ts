import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should display the main navigation and hero content', async ({ page }) => {
    await page.goto('/')

    // Check navigation
    await expect(page.getByRole('banner')).toBeVisible()
    await expect(page.getByRole('navigation')).toBeVisible()
    
    // Check navigation links
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Explore' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'About' })).toBeVisible()

    // Check logo
    await expect(page.getByAltText('Tennis Scorigami Logo')).toBeVisible()

    // Check title elements
    await expect(page.getByText('Tennis')).toBeVisible()
    await expect(page.getByText('Scorigami')).toBeVisible()
  })

  test('should navigate to explore page', async ({ page }) => {
    await page.goto('/')
    
    await page.click('text=Explore')
    await expect(page).toHaveURL('/explore')
  })

  test('should navigate to about page', async ({ page }) => {
    await page.goto('/')
    
    await page.click('text=About')
    await expect(page).toHaveURL('/about')
  })

  test('should have proper page metadata', async ({ page }) => {
    await page.goto('/')
    
    await expect(page).toHaveTitle(/Tennis Scorigami/i)
  })
})