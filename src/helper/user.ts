import { prepareRandomUser } from '@_src/factory/user.factory';
import { loginAndGetUser } from '@_src/helper/auth';
import { TestUser } from '@_src/types/test-user.type';
import { apiUrls } from '@_src/utils/api.util';
import { HTTP_STATUS } from '@_src/utils/http-status';
import { APIRequestContext, APIResponse, expect } from '@playwright/test';

export async function createUserAndLogin(
  request: APIRequestContext,
): Promise<TestUser> {
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
    userId: loginContext.userId,
    authHeader: loginContext.authHeader,
    username: registerUserData.username,
    password: registerUserData.password,
  };
}

export async function getPublicUserProfileJson(
  request: APIRequestContext,
  userId: number,
): Promise<APIResponse> {
  return await request.get(apiUrls.getPublicUserProfileUrl(userId));
}
