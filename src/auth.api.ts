import { LoginUserModel, RegisterUserModel } from '@_src/models/user.model';
import { apiUrls } from '@_src/utils/api.util';
import { APIRequestContext, APIResponse } from '@playwright/test';

export class AuthApi {
  constructor(private request: APIRequestContext) {}

  async login(data: LoginUserModel): Promise<APIResponse> {
    return await this.request.post(apiUrls.loginUrl, { data });
  }

  async register(data: RegisterUserModel): Promise<APIResponse> {
    return await this.request.post(apiUrls.registerUrl, { data});
  }
}
