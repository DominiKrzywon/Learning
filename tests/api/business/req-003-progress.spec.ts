import { AuthApi } from '@_src/api/auth.api';
import { CourseApi } from '@_src/api/course.api';
import { LessonApi } from '@_src/api/lesson.api';
import { expect, test } from '@_src/fixtures/user.fixture';
import { restoreSystem } from '@_src/helper/restore';
import { LessonModel } from '@_src/models/lessons.model';
import { courseData } from '@_src/test-data/course.data';
import { expectStatusOK, expectSuccess } from '@_src/utils/assertions';
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

    const { resEnroll } = await courseApi.enroll(courseId, userId);
    const { resGetLessons, jsonGetLessons } =
      await lessonApi.getLessons(courseId);
    const lessonId = jsonGetLessons[0].id;

    const {
      resGetProgress: beforeResGetProgress,
      jsonGetProgress: beforeJsonGetProgress,
    } = await courseApi.getProgress(courseId);

    const { resComplete, jsonComplete } = await lessonApi.complete(
      courseId,
      lessonId,
      userId,
    );

    const {
      resGetProgress: afterResGetProgress,
      jsonGetProgress: afterJsonGetProgress,
    } = await courseApi.getProgress(courseId);

    expectStatusOK(beforeResGetProgress);
    expect(beforeJsonGetProgress.length).toBe(0);
    expectStatusOK(resEnroll);
    expectStatusOK(resGetLessons);
    expectStatusOK(resComplete);
    expectStatusOK(afterResGetProgress);
    expect(afterJsonGetProgress[0].completed).toBe(true);
    expect(afterJsonGetProgress[0].lessonId).toBe(lessonId);
    expect(afterJsonGetProgress[0].courseId).toBe(courseId);
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

    const { resEnroll } = await courseApi.enroll(courseId, userId);
    const { resGetLessons, jsonGetLessons } =
      await lessonApi.getLessons(courseId);
    const lessonId = jsonGetLessons[0].id;
    const { resComplete, jsonComplete } = await lessonApi.complete(
      courseId,
      lessonId,
      userId,
    );

    const { resGetProgress, jsonGetProgress } =
      await courseApi.getProgress(courseId);
    const { resLogin, jsonLogin } = await authApi.login({ username, password });
    const {
      resGetProgress: afterResGetProgress,
      jsonGetProgress: afterJsonGetProgress,
    } = await courseApi.getProgress(courseId);

    expectStatusOK(resEnroll);
    expectStatusOK(resGetLessons);
    expectStatusOK(resComplete);
    expectStatusOK(resLogin);
    expectStatusOK(afterResGetProgress);
    expect(resGetProgress).toBeDefined();
    expectSuccess(jsonComplete);
    expect(jsonGetProgress[0].completed).toBe(true);
    expectSuccess(jsonLogin);
    expect(afterJsonGetProgress[0].completed).toBe(true);
  });

  test('REQ-003 should reject lesson completion for non-enrolled course @logged', async ({
    request,
    loggedUser,
  }) => {
    const expectedErrorMessage = 'User not enrolled in this course';
    const { authHeader, userId } = loggedUser;
    lessonApi = new LessonApi(request, authHeader);
    courseApi = new CourseApi(request, authHeader);

    const { resGetPreview, jsonGetPreview } =
      await lessonApi.getPreview(courseId);
    const { previewLessons } = jsonGetPreview;
    const lessonId = previewLessons[0].id;
    await lessonApi.complete(courseId, lessonId, userId);
    const { resGetProgress, jsonGetProgress } =
      await courseApi.getProgress(courseId);

    expectStatusOK(resGetPreview);
    expect(Array.isArray(previewLessons)).toBe(true);
    expect(previewLessons.length).toBeGreaterThan(0);
    previewLessons.forEach((lesson: LessonModel) => {
      expect(typeof lesson.id).toBe('number');
      expect(typeof lesson.title).toBe('string');
      expect(typeof lesson.type).toBe('string');
      expect(typeof lesson.completed).toBe('boolean');
      expect(typeof lesson.content).toBe('object');
    });

    expect(resGetProgress.status()).toBe(HTTP_STATUS.FORBIDDEN);
    expect(jsonGetProgress.error.message).toBe(expectedErrorMessage);
  });
});
