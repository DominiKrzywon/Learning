import { UserProfileResponse } from '@_src/models/user.model';
import { apiUrls } from '@_src/utils/api.util';
import { APIRequestContext, APIResponse } from '@playwright/test';

export class UserApi {
  constructor(
    private request: APIRequestContext,
    private authHeader?: string,
  ) {}

  async getProfile(userId: number): Promise<{
    resGetProfile: APIResponse;
    jsonGetProfile: UserProfileResponse;
  }> {
    const resGetProfile = await this.request.get(
      apiUrls.getUserProfileUrl(userId),
    );
    const jsonGetProfile = await resGetProfile.json();

    return { resGetProfile, jsonGetProfile };
  }

  async updateProfile(
    userId: number,
    payload: object,
  ): Promise<{ resUpdateProfile: APIResponse; jsonUpdateProfile: any }> {
    const resUpdateProfile = await this.request.put(
      apiUrls.putUserProfileUrl(userId),
      { headers: { Authorization: this.authHeader! }, data: payload },
    );
    const jsonUpdateProfile = await resUpdateProfile.json();

    return { resUpdateProfile, jsonUpdateProfile };
  }

  async changePassword(
    userId: number,
    payload: object,
  ): Promise<{ resChangePassword: APIResponse; jsonChangePassword: any }> {
    const resChangePassword = await this.request.put(
      apiUrls.updateUserPasswordUrl(userId),
      { headers: { Authorization: this.authHeader! }, data: payload },
    );
    const jsonChangePassword = await resChangePassword.json();

    return { resChangePassword, jsonChangePassword };
  }

  async deactivateUser(
    userId: number,
    payload: object,
  ): Promise<{ resDeactivate: APIResponse; jsonDeactivate: any }> {
    const resDeactivate = await this.request.post(
      apiUrls.deactivateUserUrl(userId),
      { headers: { Authorization: this.authHeader! }, data: payload },
    );
    const jsonDeactivate = await resDeactivate.json();

    return { resDeactivate, jsonDeactivate };
  }

  async getPublicProfile(
    userId: number,
  ): Promise<{ resGetPublicProfile: APIResponse; jsonGetPublicProfile: any }> {
    const resGetPublicProfile = await this.request.get(
      apiUrls.getPublicUserProfileUrl(userId),
    );
    const jsonGetPublicProfile = await resGetPublicProfile.json();

    return { resGetPublicProfile, jsonGetPublicProfile };
  }
}
