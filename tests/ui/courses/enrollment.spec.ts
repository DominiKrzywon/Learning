import { restoreSystem } from '@_src/helper/restore';
import { createUserAndLogin } from '@_src/helper/user';
import { expect, test } from '@_src/merge.fixture';

const courseId = 4;
const courseQuery = `?id=${courseId}`;

test.beforeEach(async ({ page, loginPage }) => {
  await restoreSystem(page.request);
  const { username, password } = await createUserAndLogin(page.request);
  await loginPage.login({ username, password });
});

test('ENROLL-001 verify if auth user can enroll on course', async ({
  courseDetailsPage,
  courseViewerPage,
}) => {
  await courseDetailsPage.goto(courseQuery);
  await courseDetailsPage.enroll();

  await expect(courseViewerPage.url).toContain('course-viewer.html');
  await expect(courseViewerPage.downloadTranscript).toBeVisible();
  await expect(courseDetailsPage.enrollButton).not.toBeVisible();
});

test('ENROLL-002 verify if enrolled course appears on dashboard', async ({
  courseDetailsPage,
  dashboardPage,
}) => {
  await courseDetailsPage.goto(courseQuery);
  await courseDetailsPage.enroll();
  await dashboardPage.goto();

  await expect(dashboardPage.getCourse(courseId)).toBeVisible();
});

test('ENROLL-003 verify access restriction without enrollment', async ({
  dashboardPage,
}) => {
  await dashboardPage.goto();
  await dashboardPage.getEnrollButton(courseId).click();

  await expect(dashboardPage.enrollError).toHaveText(dashboardPage.errorMessage);
});
