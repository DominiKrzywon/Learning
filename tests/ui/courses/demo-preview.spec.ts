import { expect, test } from '@_src/merge.fixture';

test.describe('Free Demo Preview', () => {
  test('guest can access preview and is restricted from full content', async ({
    previewPage,
    loginPage,
    instructorPage,
    welcomePage,
    page,
  }) => {
    const expectedBannerText =
      'Preview Mode - Sign in to access full course content';

    await previewPage.goto('?id=1');

    await test.step('verify preview mode', async () => {
      await expect(previewPage.previewModeBanner).toContainText(
        expectedBannerText,
      );
    });

    await test.step('verify access restriction elements visible', async () => {
      await expect(previewPage.lockLessons).toBeVisible();
      await expect(previewPage.signInToTrackProgress).toBeVisible();
      await expect(previewPage.signInCta).toBeVisible();
    });

    await test.step('verify Sign In redirects to login', async () => {
      await previewPage.signInCta.click();
      await expect(loginPage.pageHeading).toBeVisible();
      await page.goBack();
    });

    await test.step('verify instructor link navigates to instructor profile', async () => {
      await previewPage.instructorLink.click();
      await expect(instructorPage.heading).toBeVisible();
      await page.goBack();
    });

    await test.step('verify View Course redirects guest to welcome page', async () => {
      await previewPage.instructorLink.click();
      await instructorPage.coursesList
        .getByRole('link', { name: 'View Course' })
        .first()
        .click();

      await expect(welcomePage.logo).toBeVisible();
    });
  });
});
