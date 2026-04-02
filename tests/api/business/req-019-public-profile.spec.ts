import { expect, test } from '@_src/fixtures/user.fixture';
import { restoreSystem } from '@_src/helper/restore';
import { apiUrls } from '@_src/utils/api.util';
import { HTTP_STATUS } from '@_src/utils/http-status';

test.describe('REQ-019 Public User Profile', () => {
  test.beforeEach(async ({ request }) => {
    await restoreSystem(request);
  });

  test('REQ-019 should return public profile without authentication', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader, userId } = loggedUser;

    // TODO: Set profile to public via PUT /api/learning/users/{userId}/profile
    const setToPublic = await request.put(apiUrls.putUserProfileUrl(userId), {
      headers: { Authorization: authHeader },
      data: { currentPassword: loggedUser.password, isPublic: true },
    });

    // TODO: Call GET /api/learning/public/users/{userId} without auth
    const getPublicUser = await request.get(
      apiUrls.getPublicUserProfileUrl(userId),
    );
    const publicUserJson = await getPublicUser.json();

    console.log(publicUserJson);
    // TODO: Assert response shape and business fields

    expect(setToPublic.status()).toBe(HTTP_STATUS.OK);
    expect(getPublicUser.status()).toBe(HTTP_STATUS.OK);
    expect(typeof publicUserJson.id).toBe('number');
    expect(typeof publicUserJson.avatar).toBe('string');
    expect(typeof publicUserJson.joinDate).toBe('string');
    expect(typeof publicUserJson.role).toBe('string');
    expect(Array.isArray(publicUserJson.enrollments)).toBe(true);
    expect(Array.isArray(publicUserJson.certificates)).toBe(true);
    expect(Array.isArray(publicUserJson.ratings)).toBe(true);

    // expect(userId).toBeTruthy();
    // expect(apiUrls.getPublicUserProfileUrl(userId)).toContain('/public/users/');
  });

  test('REQ-019 should not expose sensitive data in public profile', async ({
    request,
    loggedUser,
  }) => {
    const { userId } = loggedUser;

    // TODO: Set profile to public via PUT /api/learning/users/{userId}/profile
    // TODO: Call GET /api/learning/public/users/{userId} without auth
    // TODO: Assert username/email/password/isPublic are undefined
    expect(userId).toBeTruthy();
    expect(apiUrls.getPublicUserProfileUrl(userId)).toContain('/public/users/');
  });

  test('REQ-019 should return 404 for private profile', async ({
    request,
    loggedUser,
  }) => {
    const { userId } = loggedUser;

    // TODO: Do not set profile public (default private)
    // TODO: Call GET /api/learning/public/users/{userId} without auth
    // TODO: Assert HTTP_STATUS.NOT_FOUND and error message
    expect(userId).toBeTruthy();
    expect(HTTP_STATUS.NOT_FOUND).toBe(404);
  });
});
