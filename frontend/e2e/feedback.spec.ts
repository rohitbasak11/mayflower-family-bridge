import { test, expect } from '@playwright/test';

test.describe('Feedback Lifecycle', () => {
    test('should allow an admin to review and respond to feedback', async ({ page }) => {
        // 1. Navigate to Admin Feedback Page
        await page.goto('/admin/feedback');

        // 2. Wait for feedback items to load
        await expect(page.getByRole('heading', { name: 'Feedback Intelligence' })).toBeVisible();

        // We expect at least one feedback item from our seed data
        const feedbackCard = page.getByTestId('feedback-card').first();
        await expect(feedbackCard).toBeVisible({ timeout: 15000 });

        // 3. Click to open detail panel
        await feedbackCard.click();

        // 4. Verify detail panel content
        await expect(page.getByRole('heading', { name: 'Feedback Details' })).toBeVisible();
        await expect(page.locator('section h3').first()).toContainText('Resident Feedback');

        // 5. Test Override Controls
        const categorySelect = page.locator('select[id^="cat-"]');
        await categorySelect.selectOption('Staff');

        // Verify "Updating..." appears and then disappears
        // (This might be too fast to catch, but we can verify the value remains set)
        await expect(categorySelect).toHaveValue('Staff');

        // 6. Test Response Editor
        const responseTextarea = page.locator('textarea[placeholder*="Type your response here"]');
        await expect(responseTextarea).toBeVisible();

        const testResponse = 'This is a test response from Playwright.';
        await responseTextarea.fill(testResponse);

        // 7. Send Response
        const sendButton = page.getByRole('button', { name: 'Send Response' });
        await sendButton.click();

        // 8. Verify the panel closes and the list updates (status should change)
        await expect(page.locator('h2')).not.toBeVisible();

        // The item we just responded to should now have "responded" status
        // We'll look for the green status dot which represents "responded"
        await expect(feedbackCard.locator('div[class*="bg-green-500"]')).toBeVisible();
    });
});
