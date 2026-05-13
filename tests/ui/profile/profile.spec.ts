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
    await loginPage.goto();
    await loginPage.login({ username: user.username, password: user.password });
    await page.waitForURL('**/dashboard.html');
    await accountSettingsPage.goto();
  });

  test('should redirect to login after updating profile @e2e', async ({
    accountSettingsPage,
    loginPage,
    page,
  }) => {
    const successMessage =
      'Profile updated successfully! Please sign in again.';
    await accountSettingsPage.updateProfile(userProfileData(password));

    await expect(accountSettingsPage.profileUpdateSuccess).toHaveText(
      successMessage,
    );

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

  test('should successfully change password @e2e', async ({
    accountSettingsPage,
    dashboardPage,
    welcomePage,
    loginPage,
  }) => {
    const expectedSuccessMessage = 'Password changed successfully!';
    const expectedErrorMessage = 'Login failed. Invalid username or password';
    const newPassword = faker.internet.password();

    await test.step('change password', async () => {
      await accountSettingsPage.changePassword(password, newPassword);
      await expect(accountSettingsPage.changePasswordSuccess).toHaveText(
        expectedSuccessMessage,
      );
    });

    await test.step('verify if old password is invalid', async () => {
      await accountSettingsPage.logout();
      await welcomePage.waitForPageToLoadUrl();
      await loginPage.goto();
      await loginPage.login({ username, password });

      await expect(loginPage.errorMessage).toHaveText(expectedErrorMessage);
    });

    await test.step('login with new password', async () => {
      await loginPage.login({ username, password: newPassword });

      await expect(dashboardPage.courseList).toBeVisible();
    });
  });

  test('should show error when changing password with wrong current password @smoke', async ({
    accountSettingsPage,
  }) => {
    const errorMessage = 'Current password is incorrect';
    const newPassword = faker.internet.password();
    await accountSettingsPage.changePassword(invalidPassword, newPassword);

    await expect(accountSettingsPage.changePasswordError).toHaveText(
      errorMessage,
    );
  });

  test('should deactivate account and block further login @e2e', async ({
    accountSettingsPage,
    welcomePage,
    loginPage,
  }) => {
    const expectedSuccessMessage =
      'Account deactivated successfully. Redirecting...';

    await accountSettingsPage.deactivateAccount(password);
    await expect(accountSettingsPage.deactivateSuccessMessage).toHaveText(
      expectedSuccessMessage,
    );

    await welcomePage.waitForPageToLoadUrl();

    await expect(welcomePage.logo).toBeVisible();

    await loginPage.goto();
    await loginPage.login({ username, password });
    await expect(loginPage.errorMessage).toHaveText(
      'Login failed. Invalid username or password',
    );
  });

  test('should show error when update profile with empty inputs @smoke', async ({
    accountSettingsPage,
  }) => {
    const expectedErrorMessage = 'Please enter your current password';
    await accountSettingsPage.profileUpdateButton.click();

    await expect(accountSettingsPage.profileUpdateError).toHaveText(
      expectedErrorMessage,
    );
  });
});
