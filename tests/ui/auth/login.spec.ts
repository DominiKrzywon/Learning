import { expect, test } from '@_src/merge.fixture';
import {
    testUserInvalidPasswordUI,
    testUserInvalidUsernameUI,
    testUserLearningUI,
} from '@_src/test-data/user.data';

test.describe('Tests for login', () => {
  test('AUTH-001 should log in with valid credentials @smoke', async ({
    loginPage,
  }) => {
    const dashboard = await loginPage.login(testUserLearningUI);
    await dashboard.waitForPageToLoadUrl();

    await expect(dashboard.courseList).toBeVisible();
  });

  test('AUTH-002 should show error for invalid password @smoke', async ({
    loginPage,
  }) => {
    await loginPage.login(testUserInvalidPasswordUI);

    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('AUTH-003 should show error for invalid username @smoke', async ({
    loginPage,
  }) => {
    await loginPage.login(testUserInvalidUsernameUI);

    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('AUTH-004 should log out to welcome page @logged @smoke', async ({
    dashboardPage,
    welcomePage,
  }) => {
    await dashboardPage.logout();
    await welcomePage.waitForPageToLoadUrl();
    await expect(welcomePage.logo).toBeVisible();
  });

  test('AUTH-005 should block my courses for guest @non-logged @smoke', async ({
    dashboardPage,
  }) => {
    await dashboardPage.goto();

    await expect(dashboardPage.myCourses).toHaveClass(/disabled-link/);
  });

  test('AUTH-006 should keep session after refresh @logged @smoke', async ({
    dashboardPage,
  }) => {
    await dashboardPage.goto();
    await dashboardPage.reload();

    await expect(dashboardPage.dashboardUsername).toBeVisible();
  });
});
