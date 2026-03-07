import { loginAndGetUser } from '@_src/helper/auth';
import { EnrollmentModel } from '@_src/models/enrollment.model';
import { apiUrls } from '@_src/utils/api.util';
import { HTTP_STATUS } from '@_src/utils/http-status';
import { expect, test } from '@playwright/test';

test.describe('Enrollments API', () => {
  const otherUserId = 2;
  const courseId = 7;
  const newCourseId = 9;

  test.beforeEach(async ({ request }) => {
    await request.get('/api/learning/system/restore2');
  });

  test('should not enroll user without token', async ({ request }) => {
    const response = await request.post(apiUrls.courseEnrollUrl(courseId));
    const responseJson = await response.json();

    expect(response.status()).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(responseJson.error.message).toBe('User not authenticated');
  });

  test.skip('should get enrollments with authorize user', async ({
    request,
  }) => {
    const { authHeader, userId } = await loginAndGetUser(request);
    const response = await request.get(apiUrls.userEnrollmentsUrl(userId), {
      headers: { Authorization: authHeader },
    });
    const responseJson = await response.json();

    expect(response.status()).toBe(HTTP_STATUS.OK);
    expect(Array.isArray(responseJson)).toBe(true);
    expect(responseJson.length).toBeGreaterThan(1);

    responseJson.forEach((enrollment: EnrollmentModel) => {
      expect(enrollment.userId).toEqual(userId);
      expect(enrollment.id).toBeGreaterThanOrEqual(1);
      expect(enrollment.progress).toBeGreaterThanOrEqual(0);
      expect(enrollment.progress).toBeLessThanOrEqual(100);
      expect(typeof enrollment.completed).toBe('boolean');
    });
  });

  test.skip('user should enroll on course with token', async ({ request }) => {
    const { authHeader, userId } = await loginAndGetUser(request);
    const response = await request.post(apiUrls.courseEnrollUrl(newCourseId), {
      data: { userId: userId },
      headers: { Authorization: authHeader },
    });
    const responseJson = await response.json();
    console.log(responseJson);

    expect(response.status()).toBe(HTTP_STATUS.OK);
    expect(responseJson.success).toBe(true);
    expect(responseJson.enrollment.courseId).toBe(newCourseId);
    expect(responseJson.enrollment.progress).toBe(0);
  });

  test('should not allow access to other user enrollments', async ({
    request,
  }) => {
    const { authHeader } = await loginAndGetUser(request);
    const otherUserCoursesGET = await request.get(
      apiUrls.userEnrollmentsUrl(otherUserId),
      {
        headers: { Authorization: authHeader },
      },
    );

    const otherUserJson = await otherUserCoursesGET.json();

    expect(otherUserCoursesGET.status()).toBe(HTTP_STATUS.FORBIDDEN);
    expect(otherUserJson.error.message).toBe('User not authorized');
  });

  test('user cannot enroll on course twice', async ({ request }) => {
    const { authHeader, userId } = await loginAndGetUser(request);
    const firstResponse = await request.post(
      apiUrls.courseEnrollUrl(newCourseId),
      {
        data: { userId: userId },
        headers: { Authorization: authHeader },
      },
    );

    const secondResponse = await request.post(
      apiUrls.courseEnrollUrl(newCourseId),
      {
        data: { userId: userId },
        headers: { Authorization: authHeader },
      },
    );

    expect(secondResponse.status()).toBe(HTTP_STATUS.BAD_REQUEST);
  });
});
