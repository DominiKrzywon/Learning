import { expect, test } from '@_src/merge.fixture';
import { testUserLearning } from '@_src/ui/test-data/user.data';

test('AUTH-001 should login with valid credentials', async ({
  loginPage,
  welcomePage,
}) => {
  await loginPage.login(testUserLearning);
  await welcomePage.waitForPageToLoadUrl();

  await expect(loginPage.courseList).toBeVisible();
});
