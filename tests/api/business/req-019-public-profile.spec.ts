import { UserApi } from '@_src/api/user.api';
import { expect, test } from '@_src/fixtures/user.fixture';
import { restoreSystem } from '@_src/helper/restore';
import { publicProfileSchema } from '@_src/schemas/public-profile.schema';
import { expectStatusOK } from '@_src/utils/assertions';
import { HTTP_STATUS } from '@_src/utils/http-status';

let userApi: UserApi;

test.describe('REQ-019 Public User Profile', () => {
  test.beforeEach(async ({ request }) => {
    await restoreSystem(request);
  });

  test('REQ-019 should return public profile without authentication @logged', async ({
    request,
    loggedUser,
  }) => {
    const successMessage = 'Profile updated successfully';
    const { authHeader, userId } = loggedUser;
    userApi = new UserApi(request, authHeader);

    const profilePayload = {
      currentPassword: loggedUser.password,
      isPublic: true,
    };
    const { resUpdateProfile, jsonUpdateProfile } = await userApi.updateProfile(
      userId,
      profilePayload,
    );
    const { resGetPublicProfile, jsonGetPublicProfile } =
      await userApi.getPublicProfile(userId);

    const validProfile = publicProfileSchema.parse(jsonGetPublicProfile);
    expect(validProfile.id).toBe(userId);
    expect(jsonUpdateProfile.message).toBe(successMessage);
    expectStatusOK(resUpdateProfile);
    expectStatusOK(resGetPublicProfile);
  });

  test('REQ-019 should not expose sensitive data in public profile @logged', async ({
    request,
    loggedUser,
  }) => {
    const successMessage = 'Profile updated successfully';
    const { authHeader, userId } = loggedUser;
    userApi = new UserApi(request, authHeader);

    const profilePayload = {
      currentPassword: loggedUser.password,
      isPublic: true,
    };
    const { resUpdateProfile, jsonUpdateProfile } = await userApi.updateProfile(
      userId,
      profilePayload,
    );
    const { resGetPublicProfile, jsonGetPublicProfile } =
      await userApi.getPublicProfile(userId);

    expectStatusOK(resUpdateProfile);
    expectStatusOK(resGetPublicProfile);
    expect(jsonUpdateProfile.message).toBe(successMessage);
    expect(jsonGetPublicProfile.username).toBeUndefined();
    expect(jsonGetPublicProfile.email).toBeUndefined();
    expect(jsonGetPublicProfile.password).toBeUndefined();
    expect(jsonGetPublicProfile.isPublic).toBeUndefined();
  });

  test('REQ-019 should return 404 for private profile @logged', async ({
    request,
    loggedUser,
  }) => {
    const expectedErrorMessage = 'Profile not found or is private';
    const { authHeader, userId } = loggedUser;
    userApi = new UserApi(request, authHeader);

    const { resGetPublicProfile, jsonGetPublicProfile } =
      await userApi.getPublicProfile(userId);

    expect(resGetPublicProfile.status()).toBe(HTTP_STATUS.NOT_FOUND);
    expect(jsonGetPublicProfile.error.message).toBe(expectedErrorMessage);
  });
});
