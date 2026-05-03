import { restoreSystem } from '@_src/helper/restore';
import { createUserAndLogin } from '@_src/helper/user';
import { expect, test } from '@_src/merge.fixture';
import { courseData } from '@_src/test-data/course.data';
import { fundsTestData } from '@_src/test-data/funds.data';

const courseQuery = `?id=${courseData.fourthCourseId}`;

test.describe('Tests for enrollment', () => {
  test.beforeEach(async ({ page, loginPage }) => {
    await restoreSystem(page.request);
    const { username, password } = await createUserAndLogin(page.request);
    await loginPage.login({ username, password });
  });

  test('ENROLL-001 verify if auth user can enroll on course @integration', async ({
    courseDetailsPage,
    courseViewerPage,
  }) => {
    await courseDetailsPage.goto(courseQuery);
    await courseDetailsPage.enroll();

    await expect(courseViewerPage.url).toContain('course-viewer.html');
    await expect(courseViewerPage.downloadTranscript).toBeVisible();
    await expect(courseDetailsPage.enrollButton).not.toBeVisible();
  });

  test('ENROLL-002 verify if enrolled course appears on dashboard @integration', async ({
    courseDetailsPage,
    dashboardPage,
  }) => {
    await courseDetailsPage.goto(courseQuery);
    await courseDetailsPage.enroll();
    await dashboardPage.goto();

    await expect(
      dashboardPage.getCourse(courseData.fourthCourseId),
    ).toBeVisible();
  });

  test('ENROLL-003 verify access restriction without enrollment @integration', async ({
    dashboardPage,
  }) => {
    await dashboardPage.goto();
    await dashboardPage.getEnrollButton(courseData.fourthCourseId).click();

    await expect(dashboardPage.enrollError).toHaveText(
      dashboardPage.errorMessage,
    );
  });

  test('ENROLL-004 verify if user with funds can enroll from dashboard @integration', async ({
    accountSettingsPage,
    dashboardPage,
    courseViewerPage,
  }) => {
    await accountSettingsPage.goto();
    const { before, after } = await accountSettingsPage.topUpFunds(
      fundsTestData.validAmount,
    );

    expect(after - before).toBe(fundsTestData.validAmount);
    await expect(accountSettingsPage.topUpSuccessNotification).toContainText(
      accountSettingsPage.topUpSuccessMessage(fundsTestData.validAmount),
    );

    await dashboardPage.goto();
    await dashboardPage.getEnrollButton(courseData.fourthCourseId).click();

    await expect(courseViewerPage.downloadTranscript).toBeVisible();
  });
});
