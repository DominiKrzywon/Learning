import { testUser1 } from '@_src/test-data/user.data';
import { apiUrls } from '@_src/utils/api.util';
import { APIRequestContext } from '@playwright/test';

export async function loginAndGetUser(
  request: APIRequestContext,
  userData = testUser1,
) {
  const loginRes = await request.post(apiUrls.loginUrl, { data: userData });
  const loginJson = await loginRes.json();

  if (!loginJson.access_token) {
    throw new Error('Login failed: no access_token in response');
  }

  const authHeader = `Bearer ${loginJson.access_token}`;
  const statusRes = await request.get(apiUrls.authStatusUrl, {
    headers: { Authorization: authHeader },
  });

  if (!statusRes.ok()) {
    throw new Error('Auth status denied');
  }

  const statusJson = await statusRes.json();
  const userId = statusJson.user?.id;

  if (!userId) {
    throw new Error('UserId not found in auth status response');
  }

  return {
    authHeader,
    userId,
  };
}
