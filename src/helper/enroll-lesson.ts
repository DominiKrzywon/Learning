import { apiUrls } from '@_src/utils/api.util';
import { HTTP_STATUS } from '@_src/utils/http-status';
import { APIRequestContext, expect } from '@playwright/test';

export async function enrollAndGetFirstLessonId(
  request: APIRequestContext,
  authHeader: string,
  userId: number,
  courseId: number,
) {
  const enroll = await request.post(apiUrls.courseEnrollUrl(courseId), {
    data: { userId },
    headers: { Authorization: authHeader },
  });
  expect(enroll.status()).toBe(HTTP_STATUS.OK);

  const getLessons = await request.get(apiUrls.courseLessonsUrl(courseId), {
    headers: { Authorization: authHeader },
  });
  expect(getLessons.status()).toBe(HTTP_STATUS.OK);

  const lessonJson = await getLessons.json();
  return lessonJson[0].id;
}
