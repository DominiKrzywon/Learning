import { expect, test } from '@_src/fixtures/user.fixture';
import { restoreSystem } from '@_src/helper/restore';
import { getPublicUserProfileJson } from '@_src/helper/user';
import { apiUrls } from '@_src/utils/api.util';
import { HTTP_STATUS } from '@_src/utils/http-status';

test.describe('REQ-019 Public User Profile', () => {
  test.beforeEach(async ({ request }) => {
    await restoreSystem(request);
  });

  test('REQ-019 should return public profile without authentication @logged', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader, userId } = loggedUser;

    const setToPublic = await request.put(apiUrls.putUserProfileUrl(userId), {
      headers: { Authorization: authHeader },
      data: { currentPassword: loggedUser.password, isPublic: true },
    });

    const getPublicUser = await getPublicUserProfileJson(request, userId);
    const publicUserJson = await getPublicUser.json();

    expect(setToPublic.status()).toBe(HTTP_STATUS.OK);
    expect(getPublicUser.status()).toBe(HTTP_STATUS.OK);
    expect(typeof publicUserJson.id).toBe('number');
    expect(typeof publicUserJson.firstName).toBe('string');
    expect(typeof publicUserJson.lastName).toBe('string');
    expect(typeof publicUserJson.avatar).toBe('string');
    expect(typeof publicUserJson.joinDate).toBe('string');
    expect(typeof publicUserJson.role).toBe('string');
    expect(Array.isArray(publicUserJson.enrollments)).toBe(true);
    expect(Array.isArray(publicUserJson.certificates)).toBe(true);
    expect(Array.isArray(publicUserJson.ratings)).toBe(true);
  });

  test('REQ-019 should not expose sensitive data in public profile @logged', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader, userId } = loggedUser;

    const setToPublic = await request.put(apiUrls.putUserProfileUrl(userId), {
      headers: { Authorization: authHeader },
      data: { currentPassword: loggedUser.password, isPublic: true },
    });

    const getPublicUser = await getPublicUserProfileJson(request, userId);
    const publicUserJson = await getPublicUser.json();

    expect(setToPublic.status()).toBe(HTTP_STATUS.OK);
    expect(getPublicUser.status()).toBe(HTTP_STATUS.OK);

    expect(publicUserJson.username).toBeUndefined();
    expect(publicUserJson.email).toBeUndefined();
    expect(publicUserJson.password).toBeUndefined();
    expect(publicUserJson.isPublic).toBeUndefined();
  });

  test('REQ-019 should return 404 for private profile @logged', async ({
    request,
    loggedUser,
  }) => {
    const { userId } = loggedUser;

    const getPublicUser = await getPublicUserProfileJson(request, userId);
    const publicUserJson = await getPublicUser.json();

    expect(getPublicUser.status()).toBe(HTTP_STATUS.NOT_FOUND);
    expect(publicUserJson.error.message).toBe(
      'Profile not found or is private',
    );
  });
});
