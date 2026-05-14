import { expect, test } from '@_src/merge.fixture';
import {
  testUserInvalidPasswordUI,
  testUserInvalidUsernameUI,
  testUserLearningUI,
  testUserLearningUIWithName,
} from '@_src/test-data/user.data';

test.describe('Tests for login', () => {
  test('should log in with valid credentials @smoke', async ({ loginPage }) => {
    const dashboard = await loginPage.login(testUserLearningUI);
    await dashboard.waitForPageToLoadUrl();

    await expect(dashboard.courseList).toBeVisible();
  });

  test('should show error for invalid password @smoke', async ({
    loginPage,
  }) => {
    await loginPage.login(testUserInvalidPasswordUI);

    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('should show error for invalid username @smoke', async ({
    loginPage,
  }) => {
    await loginPage.login(testUserInvalidUsernameUI);

    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('should log out to welcome page @logged @smoke', async ({
    dashboardPage,
    welcomePage,
  }) => {
    await dashboardPage.logout();
    await welcomePage.waitForPageToLoadUrl();
    await expect(welcomePage.logo).toBeVisible();
  });

  test('should block my courses for guest @non-logged @smoke', async ({
    dashboardPage,
  }) => {
    await dashboardPage.goto();

    await expect(dashboardPage.myCourses).toHaveClass(/disabled-link/);
  });

  test(
    'user can see his username in dashboard page ',
    { tag: ['@logged', '@smoke'] },
    async ({ dashboardPage }) => {
      await dashboardPage.goto();
      await dashboardPage.reload();

      await expect(dashboardPage.dashboardUsername).toHaveText(
        testUserLearningUIWithName.displayName,
      );
    },
  );
});
