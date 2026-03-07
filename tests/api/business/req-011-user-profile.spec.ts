import { prepareRandomUser } from '@_src/factory/user.factory';
import { loginAndGetUser } from '@_src/helper/auth';
import { userProfileData } from '@_src/test-data/user.profile.data';
import { apiUrls } from '@_src/utils/api.util';
import { HTTP_STATUS } from '@_src/utils/http-status';
import { faker } from '@faker-js/faker';
import { APIRequestContext, expect, test } from '@playwright/test';

test.describe('REQ-011 User Profile Management', () => {
  const restoreUrl = '/api/learning/system/restore2';

  async function createUserAndLogin(request: APIRequestContext) {
    const registerUserData = prepareRandomUser();
    const registerRes = await request.post(apiUrls.registerUrl, {
      data: registerUserData,
    });

    expect(registerRes.status()).toBe(HTTP_STATUS.OK);

    const loginContext = await loginAndGetUser(request, {
      username: registerUserData.username,
      password: registerUserData.password,
    });

    return {
      ...loginContext,
      registerUserData,
    };
  }

  test.beforeEach(async ({ request }) => {
    const restoreRes = await request.get(restoreUrl);
    expect(restoreRes.status()).toBe(HTTP_STATUS.OK);
  });

  test.afterEach(async ({ request }) => {
    const restoreRes = await request.get(restoreUrl);
    expect(restoreRes.status()).toBe(HTTP_STATUS.OK);
  });

  test('REQ-011 should update user profile and persist changes @logged', async ({
    request,
  }) => {
    const { authHeader, userId, registerUserData } =
      await createUserAndLogin(request);
    const beforeRes = await request.get(apiUrls.getUserProfileUrl(userId), {
      headers: { Authorization: authHeader },
    });

    expect(beforeRes.status()).toBe(HTTP_STATUS.OK);

    const beforeJson = await beforeRes.json();
    const originalEmail = beforeJson.email;

    const stamp = new Date()
      .toISOString()
      .replace(/[-:.TZ]/g, '')
      .slice(0, 12);

    const updatedEmail = `michael.${stamp}@test.test.com`;

    const updatePayload = {
      ...userProfileData,
      email: updatedEmail,
      currentPassword: registerUserData.password,
    };

    const updateRes = await request.put(apiUrls.putUserProfileUrl(userId), {
      headers: { Authorization: authHeader },
      data: updatePayload,
    });

    expect(updateRes.status()).toBe(HTTP_STATUS.OK);
    const updateJson = await updateRes.json();
    expect(updateJson.success).toBe(true);

    let currentAuthHeader = authHeader;

    let afterRes = await request.get(apiUrls.getUserProfileUrl(userId), {
      headers: { Authorization: currentAuthHeader },
    });

    if (
      afterRes.status() === HTTP_STATUS.UNAUTHORIZED ||
      afterRes.status() === HTTP_STATUS.FORBIDDEN
    ) {
      const relogin = await loginAndGetUser(request, {
        username: registerUserData.username,
        password: registerUserData.password,
      });
      currentAuthHeader = relogin.authHeader;

      afterRes = await request.get(apiUrls.getUserProfileUrl(userId), {
        headers: { Authorization: currentAuthHeader },
      });
    }

    expect(afterRes.status()).toBe(HTTP_STATUS.OK);
    const afterJson = await afterRes.json();

    expect(afterJson.email).toBe(updatedEmail);
    expect(afterJson.email).not.toBe(originalEmail);
  });

  test('REQ-011 should change password with valid current password @logged', async ({
    request,
  }) => {
    const { authHeader, userId, registerUserData } =
      await createUserAndLogin(request);

    const newPassword = faker.internet.password();
    const changePasswordPayload = {
      currentPassword: registerUserData.password,
      newPassword,
    };

    const changePassword = await request.put(
      apiUrls.updateUserPasswordUrl(userId),
      {
        headers: { Authorization: authHeader },
        data: changePasswordPayload,
      },
    );

    expect(changePassword.status()).toBe(HTTP_STATUS.OK);
    const changePasswordJson = await changePassword.json();
    expect(changePasswordJson.success).toBe(true);

    const loginNewPassword = await request.post(apiUrls.loginUrl, {
      data: { username: registerUserData.username, password: newPassword },
    });

    expect(loginNewPassword.status()).toBe(HTTP_STATUS.OK);
    const loginNewPasswordJson = await loginNewPassword.json();
    expect(loginNewPasswordJson.access_token).toBeTruthy();

    const loginWithOldPassword = await request.post(apiUrls.loginUrl, {
      data: {
        username: registerUserData.username,
        password: registerUserData.password,
      },
    });

    expect(loginWithOldPassword.status()).toBe(HTTP_STATUS.UNAUTHORIZED);
  });

  test('REQ-011 should reject password change when current password is invalid @logged', async ({
    request,
  }) => {
    const { authHeader, userId, registerUserData } =
      await createUserAndLogin(request);
    const badPassword = {
      currentPassword: 'zawszeSieWywali',
      newPassword: faker.internet.password(),
    };

    const invalidRequestPassword = await request.put(
      apiUrls.updateUserPasswordUrl(userId),
      {
        headers: { Authorization: authHeader },
        data: badPassword,
      },
    );

    const badJson = await invalidRequestPassword.json();

    expect(invalidRequestPassword.status()).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(badJson.error).toBeTruthy();
  });

  test('REQ-011 should block login and profile access after account deactivation @logged', async ({
    request,
  }) => {
    const { authHeader, userId, registerUserData } =
      await createUserAndLogin(request);
    const deactivateRes = await request.post(
      apiUrls.deactivateUserUrl(userId),
      {
        headers: { Authorization: authHeader },
        data: { password: registerUserData.password },
      },
    );

    expect(deactivateRes.status()).toBe(HTTP_STATUS.OK);
    const deactivateResJson = await deactivateRes.json();
    expect(deactivateResJson.success).toBe(true);

    const loginAgain = await request.post(apiUrls.loginUrl, {
      data: {
        username: registerUserData.username,
        password: registerUserData.password,
      },
    });

    expect(loginAgain.status()).toBe(HTTP_STATUS.UNAUTHORIZED);

    const profileAfter = await request.get(apiUrls.getUserProfileUrl(userId), {
      headers: { Authorization: authHeader },
    });

    expect([HTTP_STATUS.UNAUTHORIZED, HTTP_STATUS.FORBIDDEN]).toContain(
      profileAfter.status(),
    );
  });
});
