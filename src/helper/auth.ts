import { testUser1 } from '@_src/test-data/user.data';
import { apiUrls } from '@_src/utils/api.util';
import { APIRequestContext, expect } from '@playwright/test';

export async function loginAndGetUser(
  request: APIRequestContext,
  userData = testUser1,
) {
  const loginRes = await request.post(apiUrls.loginUrl, { data: userData });

  expect(loginRes.ok(), 'Login request should succeed').toBe(true);

  const loginJson = await loginRes.json();
  expect(
    loginJson.access_token,
    'Login response should contain access token',
  ).toBeTruthy();

  const authHeader = `Bearer ${loginJson.access_token}`;

  const statusRes = await request.get(apiUrls.authStatusUrl, {
    headers: { Authorization: authHeader },
  });
  expect(statusRes.ok(), 'Auth status request should succeed').toBe(true);

  const statusJson = await statusRes.json();
  const userId = statusJson.user?.id;
  expect(userId, 'Authenticated user id should be present').toBeTruthy();

  return {
    authHeader,
    userId,
  };
}
