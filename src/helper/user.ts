import { AuthApi } from '@_src/api/auth.api';
import { prepareRandomUser } from '@_src/factory/user.factory';
import { loginAndGetUser } from '@_src/helper/auth';
import { RegisterUserModel } from '@_src/models/user.model';
import { TestUser } from '@_src/ui/types/test-user.type';
import { APIRequestContext } from '@playwright/test';

export async function createUserAndLogin(
  request: APIRequestContext,
  userData?: RegisterUserModel,
): Promise<TestUser> {
  const finalUserData = userData || prepareRandomUser();

  const authApi = new AuthApi(request);
  const { resRegister, jsonRegister } = await authApi.register(finalUserData);
  if (!resRegister.ok()) {
    throw new Error(
      `Registration failed! Status: ${resRegister.status()} Body: ${JSON.stringify(jsonRegister)}`,
    );
  }

  const credentials = {
    username: finalUserData.username,
    password: finalUserData.password,
  };

  const login = await loginAndGetUser(request, credentials);

  return {
    userId: login.userId,
    authHeader: login.authHeader,
    username: finalUserData.username,
    password: finalUserData.password,
  };
}
