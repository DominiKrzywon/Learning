import { apiUrls } from '@_src/utils/api.util';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function completeLesson(
  request: APIRequestContext,
  authHeader: string,
  userId: number,
  courseId: number,
  lessonId: number,
): Promise<APIResponse> {
  const res = await request.post(
    apiUrls.lessonCompleteUrl(courseId, lessonId),
    {
      headers: { Authorization: authHeader },
      data: { userId },
    },
  );

  return res;
}
