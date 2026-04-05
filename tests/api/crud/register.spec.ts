import { USER_NAME } from '@_config/env.config';
import { prepareRandomUser } from '@_src/factory/user.factory';
import { restoreSystem } from '@_src/helper/restore';
import { RegisterUserModel } from '@_src/models/user.model';
import { apiUrls } from '@_src/utils/api.util';
import { HTTP_STATUS } from '@_src/utils/http-status';
import { expect, test } from '@playwright/test';

test.describe('Registration API', () => {
  let registerUserData: RegisterUserModel;

  test.beforeEach(async ({ request }) => {
    await restoreSystem(request);
    registerUserData = prepareRandomUser();
  });

  test('should register a new user @logged', async ({ request }) => {
    const response = await request.post(apiUrls.registerUrl, {
      data: registerUserData,
    });

    const responseJson = await response.json();

    expect(response.status()).toBe(HTTP_STATUS.OK);
    expect(responseJson.success).toBe(true);
  });

  test('should not register with a created username @logged', async ({
    request,
  }) => {
    registerUserData = prepareRandomUser({ username: USER_NAME });

    const response = await request.post(apiUrls.registerUrl, {
      data: registerUserData,
    });

    expect(response.status()).toBe(HTTP_STATUS.UNPROCESSABLE);
  });

  test('should not register with incorrect data - not email provided @logged', async ({
    request,
  }) => {
    registerUserData.username = USER_NAME;

    const response = await request.post(apiUrls.registerUrl, {
      data: registerUserData,
    });

    expect(response.status()).toBe(HTTP_STATUS.UNPROCESSABLE);
  });
});
