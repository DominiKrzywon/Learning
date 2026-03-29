import { ProgressModel } from '@_src/models/progress.model';
import { apiUrls } from '@_src/utils/api.util';
import { APIRequestContext } from '@playwright/test';

export async function getProgressEntry(
  request: APIRequestContext,
  authHeader: string,
  courseId: number,
  lessonId: number,
): Promise<ProgressModel | undefined> {
  const res = await request.get(apiUrls.courseProgressUrl(courseId), {
    headers: { Authorization: authHeader },
  });

  const json: ProgressModel[] = await res.json();
  const entry = json.find((e) => e.lessonId === lessonId);

  return entry;
}
