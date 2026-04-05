import { apiUrls } from '@_src/utils/api.util';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function enrollAndGetFirstLessonId(
  request: APIRequestContext,
  authHeader: string,
  userId: number,
  courseId: number,
): Promise<number> {
  const enroll = await request.post(apiUrls.courseEnrollUrl(courseId), {
    data: { userId },
    headers: { Authorization: authHeader },
  });
  if (!enroll.ok()) {
    throw new Error('Enroll on course failed!');
  }

  const getLessons = await request.get(apiUrls.courseLessonsUrl(courseId), {
    headers: { Authorization: authHeader },
  });
  if (!getLessons.ok()) {
    throw new Error('Getting lessons failed: access denied');
  }
  const lessonJson = await getLessons.json();
  return lessonJson[0].id;
}

export async function enrollInCourse(
  request: APIRequestContext,
  authHeader: string,
  userId: number,
  courseId: number,
): Promise<APIResponse> {
  const enroll = await request.post(apiUrls.courseEnrollUrl(courseId), {
    data: { userId },
    headers: { Authorization: authHeader },
  });
  if (!enroll.ok()) {
    throw new Error('Enroll on course failed!');
  }

  return enroll;
}
