import { AuthApi } from '@_src/api/auth.api';
import { APIRequestContext } from '@playwright/test';

export async function loginAndGetUser(
  request: APIRequestContext,
  credentials: { username: string; password: string },
) {
  const authApi = new AuthApi(request);
  const { resLogin, jsonLogin } = await authApi.login(credentials);

  if (!jsonLogin.access_token) {
    throw new Error('Login failed: no access_token in response');
  }

  const authHeader = `Bearer ${jsonLogin.access_token}`;
  const { resAuthStatus, jsonAuthStatus } =
    await authApi.getAuthStatus(authHeader);
  const userId = jsonAuthStatus.user?.id;

  if (!userId) {
    throw new Error('UserId not found in status response');
  }

  if (!resAuthStatus.ok()) {
    throw new Error('Auth status check failed');
  }

  return {
    authHeader,
    userId,
  };
}
