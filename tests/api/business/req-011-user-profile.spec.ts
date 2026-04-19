import { AuthApi } from '@_src/api/auth.api';
import { UserApi } from '@_src/api/user.api';
import { expect, test } from '@_src/fixtures/user.fixture';
import { restoreSystem } from '@_src/helper/restore';
import {
  invalid_password,
  userProfileData,
} from '@_src/test-data/user.profile.data';
import {
  expectErrorAssert,
  expectStatusOK,
  expectSuccess,
} from '@_src/utils/assertions';
import { HTTP_STATUS } from '@_src/utils/http-status';
import { faker } from '@faker-js/faker';

let userApi: UserApi;
let authApi: AuthApi;

test.describe('REQ-011 User Profile Management', () => {
  test.beforeEach(async ({ request }) => {
    await restoreSystem(request);
  });

  test('REQ-011 should update user profile and persist changes @logged', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader, userId, username, password } = loggedUser;
    userApi = new UserApi(request, authHeader);
    authApi = new AuthApi(request);

    const updatedEmail = faker.internet.email();
    const updatePayload = {
      ...userProfileData(password),
      email: updatedEmail,
    };
    const { resUpdateProfile, jsonUpdateProfile } = await userApi.updateProfile(
      userId,
      updatePayload,
    );
    const { resLogin, jsonLogin } = await authApi.login({ username, password });
    const newAuthHeader = `Bearer ${jsonLogin.access_token}`;

    const newUserApi = new UserApi(request, newAuthHeader);
    const { resGetProfile, jsonGetProfile } =
      await newUserApi.getProfile(userId);

    expectStatusOK(resLogin);
    expectStatusOK(resUpdateProfile);
    expectStatusOK(resGetProfile);
    expectSuccess(jsonUpdateProfile);
    expect(jsonGetProfile.email).toBe(updatedEmail);
  });

  test('REQ-011 should change password with valid current password @logged', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader, userId, username, password } = loggedUser;
    userApi = new UserApi(request, authHeader);
    authApi = new AuthApi(request);

    const newPassword = faker.internet.password();
    const changePasswordPayload = {
      currentPassword: password,
      newPassword,
    };

    const { resChangePassword, jsonChangePassword } =
      await userApi.changePassword(userId, changePasswordPayload);

    const { resLogin, jsonLogin } = await authApi.login({
      username,
      password: newPassword,
    });

    const { resLogin: resLoginOld, jsonLogin: jsonLoginOld } =
      await authApi.login({
        username,
        password,
      });

    expectStatusOK(resChangePassword);
    expectSuccess(jsonChangePassword);
    expectStatusOK(resLogin);
    expect(jsonLogin.access_token).toBeTruthy();
    expect(resLoginOld.status()).toBe(HTTP_STATUS.UNAUTHORIZED);
    expectErrorAssert(jsonLoginOld);
  });

  test('REQ-011 should reject password change when current password is invalid @logged', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader, userId } = loggedUser;
    userApi = new UserApi(request, authHeader);

    const badPassword = {
      currentPassword: invalid_password,
      newPassword: faker.internet.password(),
    };

    const { resChangePassword, jsonChangePassword } =
      await userApi.changePassword(userId, badPassword);

    expect(resChangePassword.status()).toBe(HTTP_STATUS.UNAUTHORIZED);
    expectErrorAssert(jsonChangePassword);
  });

  test('REQ-011 should block login and profile access after account deactivation @logged', async ({
    request,
    loggedUser,
  }) => {
    const expectedLoginError = 'Invalid credentials';
    const expectedAuthError = 'User not authorized';
    const { authHeader, userId, username, password } = loggedUser;
    userApi = new UserApi(request, authHeader);
    authApi = new AuthApi(request);

    const { resDeactivate, jsonDeactivate } = await userApi.deactivateUser(
      userId,
      { password },
    );
    const { resLogin, jsonLogin } = await authApi.login({ username, password });
    const { resGetProfile, jsonGetProfile } = await userApi.getProfile(userId);

    expectStatusOK(resDeactivate);
    expectSuccess(jsonDeactivate);
    expect(resLogin.status()).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(jsonLogin.error.message).toBe(expectedLoginError);
    expect([HTTP_STATUS.UNAUTHORIZED, HTTP_STATUS.FORBIDDEN]).toContain(
      resGetProfile.status(),
    );
    expect(jsonGetProfile.error.message).toBe(expectedAuthError);
  });
});
