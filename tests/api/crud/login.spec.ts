import { prepareRandomUser } from '@_src/factory/user.factory';
import { testUser1, testUserIncorrect } from '@_src/test-data/user.data';
import { apiUrls } from '@_src/utils/api.util';
import { HTTP_STATUS } from '@_src/utils/http-status';
import { expect, test } from '@playwright/test';

test.describe('Login API', () => {
  test.beforeEach(async ({ request }) => {
    const restoreRes = await request.get('/api/learning/system/restore2');
    expect(restoreRes.status()).toBe(HTTP_STATUS.OK);

    const registerRes = await request.post(apiUrls.registerUrl, {
      data: testUser1,
    });
    expect([
      HTTP_STATUS.OK,
      HTTP_STATUS.BAD_REQUEST,
      HTTP_STATUS.UNPROCESSABLE,
    ]).toContain(registerRes.status());
  });
  
  test.afterEach(async ({ request }) => {
    const restoreRes = await request.get('/api/learning/system/restore2');
    expect(restoreRes.status()).toBe(HTTP_STATUS.OK);
  });

  test('should login with valid credentials @logged', async ({ request }) => {
    const response = await request.post(apiUrls.loginUrl, {
      data: testUser1,
    });

    const responseJson = await response.json();

    expect(response.status()).toBe(HTTP_STATUS.OK);
    expect(responseJson.success).toBe(true);
    expect(responseJson.access_token).toBeTruthy();
  });

  test('should not login with incorrect credentials @logged', async ({
    request,
  }) => {
    const response = await request.post(apiUrls.loginUrl, {
      data: testUserIncorrect,
    });

    expect(response.status()).toBe(HTTP_STATUS.UNAUTHORIZED);
  });

  test('should successfully login after registration @logged', async ({
    request,
  }) => {
    const registerUserData = prepareRandomUser();
    await test.step('verify register', async () => {
      const response = await request.post(apiUrls.registerUrl, {
        data: registerUserData,
      });

      const responseJson = await response.json();

      expect(response.status()).toBe(HTTP_STATUS.OK);
      expect(responseJson.success).toBe(true);
    });
    await test.step('verify login', async () => {
      const response = await request.post(apiUrls.loginUrl, {
        data: {
          username: registerUserData.username,
          password: registerUserData.password,
        },
      });

      const responseJson = await response.json();

      expect(response.status()).toBe(HTTP_STATUS.OK);
      expect(responseJson.success).toBe(true);
      expect(responseJson.access_token).toBeTruthy();
    });
  });
});
