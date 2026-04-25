import { expect, test } from '@_src/merge.fixture';
import {
  testUserInvalidPassword,
  testUserInvalidUsername,
  testUserLearning,
} from '@_src/ui/test-data/user.data';

test('AUTH-001 should login with valid credentials', async ({
  loginPage,
  dashboardPage,
}) => {
  await loginPage.login(testUserLearning);
  await dashboardPage.waitForPageToLoadUrl();

  await expect(dashboardPage.courseList).toBeVisible();
});

test('AUTH-002 should not login with invalid password', async ({
  loginPage,
}) => {
  await loginPage.login(testUserInvalidPassword);

  await expect(loginPage.errorMessage).toBeVisible();
});

test('AUTH-003 should not login with invalid username', async ({
  loginPage,
}) => {
  await loginPage.login(testUserInvalidUsername);

  await expect(loginPage.errorMessage).toBeVisible();
});

test('AUTH-004 should logout from dashboard @logged', async ({
  dashboardPage,
}) => {
  const welcomePage = await dashboardPage.logout();
  await welcomePage.waitForPageToLoadUrl();

  await expect(welcomePage.logo).toBeVisible();
});

test('AUTH-005 should cannot take lesson without login @non-logged', async ({
  dashboardPage,
}) => {
  await dashboardPage.goto();

  await expect(dashboardPage.myCourses).toHaveClass(/disabled-link/);
});

test('AUTH-006 verify if session persists after page refresh @logged', async ({
  dashboardPage,
}) => {
  await dashboardPage.goto();
  await dashboardPage.reload();

  await expect(dashboardPage.dashboardUsername).toBeVisible();
});
