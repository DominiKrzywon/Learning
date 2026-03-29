import { expect, test } from '@_src/fixtures/user.fixture';
import { completeLesson } from '@_src/helper/complete-lesson';
import { enrollAndGetFirstLessonId } from '@_src/helper/enroll-lesson';
import { getProgressEntry } from '@_src/helper/progress';
import { restoreSystem } from '@_src/helper/restore';
import { LessonModel } from '@_src/models/lessons.model';
import { apiUrls } from '@_src/utils/api.util';
import { HTTP_STATUS } from '@_src/utils/http-status';

test.describe('REQ-003 User Progress Monitor', () => {
  const courseId = 1;

  test.beforeEach(async ({ request }) => {
    await restoreSystem(request);
  });

  test('REQ-003 progress calculation, modification', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader, userId } = loggedUser;

    const lessonId = await enrollAndGetFirstLessonId(
      request,
      authHeader,
      userId,
      courseId,
    );

    const beforeEntry = await getProgressEntry(
      request,
      authHeader,
      courseId,
      lessonId,
    );
    expect(beforeEntry).toBeUndefined();

    await completeLesson(request, authHeader, userId, courseId, lessonId);

    const afterEntry = await getProgressEntry(
      request,
      authHeader,
      courseId,
      lessonId,
    );

    expect(afterEntry).toBeDefined();
    expect(afterEntry?.lessonId).toBe(lessonId);
    expect(afterEntry?.courseId).toBe(courseId);
    expect(afterEntry?.completed).toBe(true);
    expect(afterEntry?.completedAt).toBeTruthy();
  });

  test('REQ-003 check progress after logout', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader, userId } = loggedUser;

    const lessonId = await enrollAndGetFirstLessonId(
      request,
      authHeader,
      userId,
      courseId,
    );

    await completeLesson(request, authHeader, userId, courseId, lessonId);

    const beforeLogin = await getProgressEntry(
      request,
      authHeader,
      courseId,
      lessonId,
    );
    expect(beforeLogin?.completed).toBe(true);

    const login = await request.post(apiUrls.loginUrl, {
      data: loggedUser,
    });
    expect(login.status()).toBe(HTTP_STATUS.OK);

    const checkProgressAfter = await getProgressEntry(
      request,
      authHeader,
      courseId,
      lessonId,
    );
    expect(checkProgressAfter).toBeDefined();
    expect(checkProgressAfter?.lessonId).toBe(lessonId);
    expect(checkProgressAfter?.courseId).toBe(courseId);
    expect(checkProgressAfter?.completed).toBe(true);
    expect(checkProgressAfter?.completedAt).toBeTruthy();
  });

  test('REQ-003 complete lesson for non-enrolled course returns error', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader, userId } = loggedUser;

    const getLesson = await request.get(
      apiUrls.courseLessonsPreviewUrl(courseId),
      {
        headers: { Authorization: authHeader },
      },
    );
    expect(getLesson.status()).toBe(HTTP_STATUS.OK);

    const { previewLessons } = await getLesson.json();

    expect(Array.isArray(previewLessons)).toBe(true);
    expect(previewLessons.length).toBeGreaterThan(0);
    previewLessons.forEach((lesson: LessonModel) => {
      expect(typeof lesson.id).toBe('number');
      expect(typeof lesson.title).toBe('string');
      expect(typeof lesson.type).toBe('string');
      expect(typeof lesson.completed).toBe('boolean');
      expect(typeof lesson.content).toBe('object');
    });

    const lessonId = previewLessons[0].id;
    const wrongComplete = await completeLesson(
      request,
      authHeader,
      userId,
      courseId,
      lessonId,
    );
    expect(wrongComplete).toBeUndefined();
  });
});
