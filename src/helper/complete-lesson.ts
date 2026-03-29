import { apiUrls } from '@_src/utils/api.util';
import { HTTP_STATUS } from '@_src/utils/http-status';
import { APIRequestContext, expect } from '@playwright/test';

export async function completeLesson(
  request: APIRequestContext,
  authHeader: string,
  userId: number,
  courseId: number,
  lessonId: number,
): Promise<void> {
  const res = await request.post(
    apiUrls.lessonCompleteUrl(courseId, lessonId),
    {
      headers: { Authorization: authHeader },
      data: { userId },
    },
  );
  expect(res.status()).toBe(HTTP_STATUS.OK);
}
