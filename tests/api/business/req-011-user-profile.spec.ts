import { expect, test } from '@_src/fixtures/user.fixture';
import { loginAndGetUser } from '@_src/helper/auth';
import { restoreSystem } from '@_src/helper/restore';
import { userProfileData } from '@_src/test-data/user.profile.data';
import { apiUrls } from '@_src/utils/api.util';
import { HTTP_STATUS } from '@_src/utils/http-status';
import { faker } from '@faker-js/faker';

test.describe('REQ-011 User Profile Management', () => {
  test.beforeEach(async ({ request }) => {
    await restoreSystem(request);
  });

  test('REQ-011 should update user profile and persist changes @logged', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader, userId, username, password } = loggedUser;

    const updatedEmail = faker.internet.email();

    const updatePayload = {
      ...userProfileData(password),
      email: updatedEmail,
    };

    const updateRes = await request.put(apiUrls.putUserProfileUrl(userId), {
      headers: { Authorization: authHeader },
      data: updatePayload,
    });

    expect(updateRes.status()).toBe(HTTP_STATUS.OK);
    const updateJson = await updateRes.json();
    expect(updateJson.success).toBe(true);

    const relogin = await loginAndGetUser(request, {
      username,
      password,
    });
    const currentAuthHeader = relogin.authHeader;

    const afterRes = await request.get(apiUrls.getUserProfileUrl(userId), {
      headers: { Authorization: currentAuthHeader },
    });

    expect(afterRes.status()).toBe(HTTP_STATUS.OK);
    const afterJson = await afterRes.json();

    expect(afterJson.email).toBe(updatedEmail);
  });

  test('REQ-011 should change password with valid current password @logged', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader, userId, username, password } = loggedUser;

    const newPassword = faker.internet.password();
    const changePasswordPayload = {
      currentPassword: password,
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
      data: { username, password: newPassword },
    });

    expect(loginNewPassword.status()).toBe(HTTP_STATUS.OK);
    const loginNewPasswordJson = await loginNewPassword.json();
    expect(loginNewPasswordJson.access_token).toBeTruthy();

    const loginWithOldPassword = await request.post(apiUrls.loginUrl, {
      data: {
        username,
        password,
      },
    });

    expect(loginWithOldPassword.status()).toBe(HTTP_STATUS.UNAUTHORIZED);
  });

  test('REQ-011 should reject password change when current password is invalid @logged', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader, userId } = loggedUser;
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
    loggedUser,
  }) => {
    const { authHeader, userId, username, password } = loggedUser;

    const deactivateRes = await request.post(
      apiUrls.deactivateUserUrl(userId),
      {
        headers: { Authorization: authHeader },
        data: { password },
      },
    );

    expect(deactivateRes.status()).toBe(HTTP_STATUS.OK);
    const deactivateResJson = await deactivateRes.json();
    expect(deactivateResJson.success).toBe(true);

    const loginAgain = await request.post(apiUrls.loginUrl, {
      data: {
        username,
        password,
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
