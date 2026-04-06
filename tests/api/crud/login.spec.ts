import { AuthApi } from '@_src/api/auth.api';
import { CourseApi } from '@_src/api/course.api';
import { prepareRandomUser } from '@_src/factory/user.factory';
import { restoreSystem } from '@_src/helper/restore';
import { testUser1, testUserIncorrect } from '@_src/test-data/user.data';
import { HTTP_STATUS } from '@_src/utils/http-status';
import { expect, test } from '@playwright/test';

let authApi: AuthApi;


test.describe('Login API', () => {
  test.beforeEach(async ({ request }) => {
    await restoreSystem(request);
    authApi = new AuthApi(request);

  });

  test('should login with valid credentials @logged', async () => {
    const { resLogin, jsonLogin } = await authApi.login(testUser1);

    expect(resLogin.status()).toBe(HTTP_STATUS.OK);
    expect(jsonLogin.success).toBe(true);
    expect(jsonLogin.access_token).toBeTruthy();
  });

  test('should not login with incorrect credentials @logged', async () => {
    const { resLogin, jsonLogin } = await authApi.login(testUserIncorrect);
    const expectedErrorMessage = 'Invalid credentials';

    expect(resLogin.status()).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(jsonLogin).toHaveProperty('error.message', expectedErrorMessage);
  });

  test('should successfully login after registration @logged', async () => {
    const registerUserData = prepareRandomUser();

    const { resRegister, jsonRegister } =
      await authApi.register(registerUserData);

    expect(resRegister.status()).toBe(HTTP_STATUS.OK);
    expect(jsonRegister.success).toBe(true);

    const { resLogin, jsonLogin } = await authApi.login({
      username: registerUserData.username,
      password: registerUserData.password,
    });

    expect(resLogin.status()).toBe(HTTP_STATUS.OK);
    expect(jsonLogin.success).toBe(true);
    expect(jsonLogin.access_token).toBeTruthy();
  });
});
