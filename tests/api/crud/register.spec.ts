import { USER_NAME } from '@_config/env.config';
import { AuthApi } from '@_src/api/auth.api';
import { prepareRandomUser } from '@_src/factory/user.factory';
import { restoreSystem } from '@_src/helper/restore';
import { RegisterUserModel } from '@_src/models/user.model';
import { HTTP_STATUS } from '@_src/utils/http-status';
import { expect, test } from '@playwright/test';

test.describe('Registration API', () => {
  let registerUserData: RegisterUserModel;
  let authApi: AuthApi;

  test.beforeEach(async ({ request }) => {
    await restoreSystem(request);
    registerUserData = prepareRandomUser();
    authApi = new AuthApi(request);
  });

  test('should register a new user @logged', async () => {
    const { resRegister, jsonRegister } =
      await authApi.register(registerUserData);

    expect(resRegister.status()).toBe(HTTP_STATUS.OK);
    expect(jsonRegister.success).toBe(true);
  });

  test('should not register with a created username @logged', async () => {
    registerUserData = prepareRandomUser({ username: USER_NAME });
    const expectedErrorMessage =
      'User already exists with that username or email';
    const { resRegister, jsonRegister } =
      await authApi.register(registerUserData);

    expect(resRegister.status()).toBe(HTTP_STATUS.UNPROCESSABLE);
    expect(jsonRegister).toHaveProperty('error.message', expectedErrorMessage);
  });

  test('should not register with incorrect data - not email provided @logged', async () => {
    registerUserData.username = USER_NAME;
    const expectedErrorMessage =
      'User already exists with that username or email';
    const { resRegister, jsonRegister } =
      await authApi.register(registerUserData);

    expect(resRegister.status()).toBe(HTTP_STATUS.UNPROCESSABLE);
    expect(jsonRegister).toHaveProperty('error.message', expectedErrorMessage);
  });
});
