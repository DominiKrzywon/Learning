import { PreviewLessonsResponse } from '@_src/models/lessons.model';
import { apiUrls } from '@_src/utils/api.util';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function getPreviewLessons(
  request: APIRequestContext,
  courseId: number,
): Promise<{
  resPreviewLessons: APIResponse;
  jsonPreviewLessons: PreviewLessonsResponse;
}> {
  const resPreviewLessons = await request.get(
    apiUrls.courseLessonsPreviewUrl(courseId),
  );
  const jsonPreviewLessons = await resPreviewLessons.json();

  return { resPreviewLessons, jsonPreviewLessons };
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
