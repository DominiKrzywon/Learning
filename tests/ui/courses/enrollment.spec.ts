import { restoreSystem } from '@_src/helper/restore';
import { createUserAndLogin } from '@_src/helper/user';
import { expect, test } from '@_src/merge.fixture';

test.beforeEach(async ({ page, loginPage }) => {
  await restoreSystem(page.request);
  const { username, password } = await createUserAndLogin(page.request);
  await loginPage.login({ username, password });
});

test('ENROLL-001 verify if auth user can enroll on course', async ({
  courseDetailsPage,
  courseViewerPage,
}) => {
  const idCourse = '?id=4';
  await courseDetailsPage.goto(idCourse);
  await courseDetailsPage.enroll();

  await expect(courseViewerPage.url).toContain('course-viewer.html');
  await expect(courseViewerPage.downloadTranscript).toBeVisible();
});
