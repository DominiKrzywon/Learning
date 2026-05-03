import { expect, test } from '@_src/merge.fixture';
import {
  testUserInvalidPasswordUI,
  testUserInvalidUsernameUI,
  testUserLearningUI,
} from '@_src/test-data/user.data';

test.describe('Tests for login', () => {
  test('AUTH-001 should login with valid credentials @smoke', async ({
    loginPage,
  }) => {
    const dashboard = await loginPage.login(testUserLearningUI);
    await dashboard.waitForPageToLoadUrl();

    await expect(dashboard.courseList).toBeVisible();
  });

  test('AUTH-002 should not login with invalid password @smoke', async ({
    loginPage,
  }) => {
    await loginPage.login(testUserInvalidPasswordUI);

    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('AUTH-003 should not login with invalid username @smoke', async ({
    loginPage,
  }) => {
    await loginPage.login(testUserInvalidUsernameUI);

    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('AUTH-004 should logout from dashboard @logged @integration', async ({
    dashboardPage,
    welcomePage,
  }) => {
    await dashboardPage.logout();
    await welcomePage.waitForPageToLoadUrl();
    await expect(welcomePage.logo).toBeVisible();
  });

  test('AUTH-005 should cannot take lesson without login @non-logged @integration', async ({
    dashboardPage,
  }) => {
    await dashboardPage.goto();

    await expect(dashboardPage.myCourses).toHaveClass(/disabled-link/);
  });

  test('AUTH-006 verify if session persists after page refresh @logged @integration', async ({
    dashboardPage,
  }) => {
    await dashboardPage.goto();
    await dashboardPage.reload();

    await expect(dashboardPage.dashboardUsername).toBeVisible();
  });
});
