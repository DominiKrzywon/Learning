import { UserApi } from '@_src/api/user.api';
import { loginAndGetUser } from '@_src/helper/auth';
import { restoreSystem } from '@_src/helper/restore';
import { createUserAndLogin } from '@_src/helper/user';
import { expect, test } from '@_src/merge.fixture';
import {
  invalidPassword,
  userProfileData,
} from '@_src/test-data/user.profile.data';
import { faker } from '@faker-js/faker';

test.describe('Test for user profile', () => {
  let authHeader: string;
  let userId: number;
  let username: string;
  let password: string;

  test.beforeEach(async ({ page, loginPage, accountSettingsPage }) => {
    await restoreSystem(page.request);
    const user = await createUserAndLogin(page.request);
    authHeader = user.authHeader;
    userId = user.userId;
    username = user.username;
    password = user.password;
    await loginPage.login({ username: user.username, password: user.password });
    await page.waitForURL('**/dashboard.html');
    await accountSettingsPage.goto();
  });

  test('PROFILE-001 verify redirect after update profile e2e', async ({
    accountSettingsPage,
    loginPage,
    page,
  }) => {
    await accountSettingsPage.updateProfile(userProfileData(password));

    await expect(accountSettingsPage.profileUpdateSuccess).toBeVisible();

    await loginPage.waitForPageToLoadUrl();
    const newLogin = await loginAndGetUser(page.request, {
      username,
      password,
    });

    const { jsonGetProfile } = await new UserApi(
      page.request,
      newLogin.authHeader,
    ).getProfile(newLogin.userId);

    expect(jsonGetProfile.email).toBe(userProfileData(password).email);
  });

  test('PROFILE-002 verify successfully change password e2e', async ({
    accountSettingsPage,
    dashboardPage,
    welcomePage,
    loginPage,
  }) => {
    const expectedErrorMessage = 'Login failed. Invalid username or password';
    const newPassword = faker.internet.password();
    await accountSettingsPage.changePassword(password, newPassword);
    await expect(accountSettingsPage.changePasswordSuccess).toBeVisible();

    await accountSettingsPage.logout();
    await welcomePage.waitForPageToLoadUrl();
    await loginPage.goto();
    await loginPage.login({ username, password });

    await expect(loginPage.errorMessage).toHaveText(expectedErrorMessage);

    await loginPage.login({ username, password: newPassword });

    await expect(dashboardPage.courseList).toBeVisible();
  });

  test('PROFILE-003 verify error message with wrong password @integration', async ({
    accountSettingsPage,
  }) => {
    const newPassword = faker.internet.password();
    await accountSettingsPage.changePassword(invalidPassword, newPassword);

    await expect(accountSettingsPage.changePasswordError).toBeVisible();
  });

  test('PROFILE-004 verify account deactivation e2e', async ({
    accountSettingsPage,
    welcomePage,
    loginPage,
  }) => {
    await accountSettingsPage.deactivateAccount(password);
    await expect(accountSettingsPage.deactivateSuccessMessage).toBeVisible();

    await welcomePage.waitForPageToLoadUrl();

    await expect(welcomePage.logo).toBeVisible();

    await loginPage.goto();
    await loginPage.login({ username, password });
    await expect(loginPage.errorMessage).toBeVisible();
  });
});
