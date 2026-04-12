import { apiUrls } from '@_src/utils/api.util';
import { APIRequestContext, APIResponse } from '@playwright/test';

export class AuthApi {
  constructor(private request: APIRequestContext) {}

  async login(userData: { username: string; password: string }): Promise<{
    resLogin: APIResponse;
    jsonLogin: any;
  }> {
    const resLogin = await this.request.post(apiUrls.loginUrl, {
      data: userData,
    });
    const jsonLogin = await resLogin.json();
    return { resLogin, jsonLogin };
  }

  async register(
    userData: object,
  ): Promise<{ resRegister: APIResponse; jsonRegister: any }> {
    const resRegister = await this.request.post(apiUrls.registerUrl, {
      data: userData,
    });
    const jsonRegister = await resRegister.json();
    return { resRegister, jsonRegister };
  }

  async getAuthStatus(authHeader: string): Promise<{
    resAuthStatus: APIResponse;
    jsonAuthStatus: any;
  }> {
    const resAuthStatus = await this.request.get(apiUrls.authStatusUrl, {
      headers: { Authorization: authHeader },
    });
    const jsonAuthStatus = await resAuthStatus.json();

    return { resAuthStatus, jsonAuthStatus };
  }
}
