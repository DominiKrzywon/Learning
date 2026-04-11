import { prepareRandomUser } from '@_src/factory/user.factory';
import { loginAndGetUser } from '@_src/helper/auth';
import { TestUser } from '@_src/types/test-user.type';
import { apiUrls } from '@_src/utils/api.util';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function createUserAndLogin(
  request: APIRequestContext,
): Promise<TestUser> {
  const registerUserData = prepareRandomUser();
  await request.post(apiUrls.registerUrl, {
    data: registerUserData,
  });

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
