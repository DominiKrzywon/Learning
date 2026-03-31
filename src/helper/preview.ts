import { apiUrls } from '@_src/utils/api.util';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function getPreviewLessons(
  request: APIRequestContext,
  courseId: number,
): Promise<APIResponse> {
  return request.get(apiUrls.courseLessonsPreviewUrl(courseId));
}

export async function getLessonContent(
  request: APIRequestContext,
  authHeader: string,
  courseId: number,
  lessonId: number,
): Promise<APIResponse> {
  return request.get(apiUrls.lessonContentUrl(courseId, lessonId), {
    headers: { Authorization: authHeader },
  });
}
