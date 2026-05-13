import { expect, test } from '@_src/merge.fixture';
import { waitForResponse } from '@_src/ui/utils/wait.util';
import { apiUrls } from '@_src/utils/api.util';
import { HTTP_STATUS } from '@_src/utils/http-status';

test.describe('Free Demo Preview', () => {
  test('banner displays preview mode text @non-logged', async ({
    previewPage,
  }) => {
    await previewPage.goto('?id=1');

    await expect(previewPage.previewModeBanner).toContainText(
      'Preview Mode - Sign in to access full course content',
    );
  });

  test('guest sees access restriction elements @non-logged', async ({
    previewPage,
    courseViewerPage,
  }) => {
    await previewPage.goto('?id=1');

    await expect(previewPage.lockLessons).toContainText(
      'More Lessons Available',
    );
    await expect(previewPage.signInToTrackProgress).toBeVisible();
    await expect(previewPage.signInCta).toBeVisible();
    await expect(
      courseViewerPage.lessonCompletedNotification,
    ).not.toBeVisible();
  });

  test('Sign In button redirects to login page @non-logged', async ({
    previewPage,
    loginPage,
  }) => {
    await previewPage.goto('?id=1');
    await previewPage.signInCta.click();

    await expect(loginPage.pageHeading).toHaveText('Sign In');
  });

  test('instructor link navigates to instructor profile @non-logged', async ({
    previewPage,
    instructorPage,
  }) => {
    await previewPage.goto('?id=1');
    await previewPage.instructorLink.click();

    await expect(instructorPage.heading).toHaveText('Instructor Profile');
  });

  test('guest accessing course via instructor profile redirects to welcome page @non-logged', async ({
    previewPage,
    instructorPage,
    welcomePage,
    page,
  }) => {
    await previewPage.goto('?id=1');
    await previewPage.instructorLink.click();

    const [response] = await Promise.all([
      waitForResponse(
        page,
        apiUrls.userEnrollmentsUrl(null),
        'GET',
        HTTP_STATUS.FORBIDDEN,
      ),
      instructorPage.coursesList
        .getByRole('link', { name: 'View Course' })
        .first()
        .click(),
    ]);

    expect(response.status()).toBe(HTTP_STATUS.FORBIDDEN);
    await expect(welcomePage.logo).toBeVisible();
  });
});
