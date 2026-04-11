import { AuthApi } from '@_src/api/auth.api';
import { CourseApi } from '@_src/api/course.api';
import { LessonApi } from '@_src/api/lesson.api';
import { expect, test } from '@_src/fixtures/user.fixture';
import { restoreSystem } from '@_src/helper/restore';
import { LessonModel } from '@_src/models/lessons.model';
import { courseData } from '@_src/test-data/course.data';
import { HTTP_STATUS } from '@_src/utils/http-status';

let courseApi: CourseApi;
let lessonApi: LessonApi;
let authApi: AuthApi;

test.describe('REQ-003 User Progress Monitor', () => {
  const courseId = courseData.defaultCourseId;
  test.beforeEach(async ({ request }) => {
    await restoreSystem(request);
  });

  test('REQ-003 should track progress after lesson completion @logged', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader, userId } = loggedUser;
    lessonApi = new LessonApi(request, authHeader);
    courseApi = new CourseApi(request, authHeader);

    const { resEnroll } = await courseApi.enrollCourse(courseId, userId);
    const { responseLessons, jsonLessons } =
      await lessonApi.getLessons(courseId);
    const lessonId = jsonLessons[0].id;

    const {
      responseProgress: beforeResponseProgress,
      jsonProgress: beforeJsonProgress,
    } = await courseApi.getProgress(courseId);

    const { responseComplete, jsonComplete } = await lessonApi.complete(
      courseId,
      lessonId,
      userId,
    );

    const {
      responseProgress: afterResponseProgress,
      jsonProgress: afterJsonProgress,
    } = await courseApi.getProgress(courseId);

    expect(beforeResponseProgress.status()).toBe(HTTP_STATUS.OK);
    expect(beforeJsonProgress.length).toBe(0);
    expect(resEnroll.status()).toBe(HTTP_STATUS.OK);
    expect(responseLessons.status()).toBe(HTTP_STATUS.OK);
    expect(responseComplete.status()).toBe(HTTP_STATUS.OK);
    expect(afterResponseProgress.status()).toBe(HTTP_STATUS.OK);
    expect(afterJsonProgress[0].completed).toBe(true);
    expect(afterJsonProgress[0].lessonId).toBe(lessonId);
    expect(afterJsonProgress[0].courseId).toBe(courseId);
    expect(jsonComplete.success).toBe(true);
  });

  test('REQ-003 should persist progress after relogin @logged', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader, userId, username, password } = loggedUser;
    lessonApi = new LessonApi(request, authHeader);
    courseApi = new CourseApi(request, authHeader);
    authApi = new AuthApi(request);

    const { resEnroll } = await courseApi.enrollCourse(courseId, userId);
    const { responseLessons, jsonLessons } =
      await lessonApi.getLessons(courseId);
    const lessonId = jsonLessons[0].id;
    const { responseComplete, jsonComplete } = await lessonApi.complete(
      courseId,
      lessonId,
      userId,
    );

    const { responseProgress, jsonProgress } =
      await courseApi.getProgress(courseId);
    const { resLogin, jsonLogin } = await authApi.login({ username, password });
    const {
      responseProgress: afterResponseProgress,
      jsonProgress: afterJsonProgress,
    } = await courseApi.getProgress(courseId);

    expect(resEnroll.status()).toBe(HTTP_STATUS.OK);
    expect(responseLessons.status()).toBe(HTTP_STATUS.OK);
    expect(responseComplete.status()).toBe(HTTP_STATUS.OK);
    expect(resLogin.status()).toBe(HTTP_STATUS.OK);
    expect(afterResponseProgress.status()).toBe(HTTP_STATUS.OK);
    expect(responseProgress).toBeDefined();
    expect(jsonComplete.success).toBe(true);
    expect(jsonProgress[0].completed).toBe(true);
    expect(jsonLogin.success).toBe(true);
    expect(afterJsonProgress[0].completed).toBe(true);
  });

  test('REQ-003 should reject lesson completion for non-enrolled course @logged', async ({
    request,
    loggedUser,
  }) => {
    const expectedErrorMessage = 'User not enrolled in this course';
    const { authHeader, userId } = loggedUser;
    lessonApi = new LessonApi(request, authHeader);
    courseApi = new CourseApi(request, authHeader);

    const { responsePreview, jsonPreview } =
      await lessonApi.getPreview(courseId);
    const { previewLessons } = jsonPreview;
    const lessonId = previewLessons[0].id;
    await lessonApi.complete(courseId, lessonId, userId);
    const { responseProgress, jsonProgress } =
      await courseApi.getProgress(courseId);

    expect(responsePreview.status()).toBe(HTTP_STATUS.OK);
    expect(Array.isArray(previewLessons)).toBe(true);
    expect(previewLessons.length).toBeGreaterThan(0);
    previewLessons.forEach((lesson: LessonModel) => {
      expect(typeof lesson.id).toBe('number');
      expect(typeof lesson.title).toBe('string');
      expect(typeof lesson.type).toBe('string');
      expect(typeof lesson.completed).toBe('boolean');
      expect(typeof lesson.content).toBe('object');
    });

    expect(responseProgress.status()).toBe(HTTP_STATUS.FORBIDDEN);
    expect(jsonProgress.error.message).toBe(expectedErrorMessage);
  });
});
