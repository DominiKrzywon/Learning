import { CourseApi } from '@_src/api/course.api';
import { LessonApi } from '@_src/api/lesson.api';
import { expect, test } from '@_src/fixtures/user.fixture';
import { restoreSystem } from '@_src/helper/restore';
import {
  LessonContentResponseSchema,
  PreviewLessonsResponseSchema,
} from '@_src/schemas/lessons.schema';
import { courseData } from '@_src/test-data/course.data';
import {
  expectErrorAssert,
  expectStatusOK,
  expectSuccess,
} from '@_src/utils/assertions';
import { HTTP_STATUS } from '@_src/utils/http-status';

let lessonApi: LessonApi;
let courseApi: CourseApi;
const courseId = courseData.defaultCourseId;

test.describe('REQ-017 Free Demo Preview', () => {
  test.beforeEach(async ({ request }) => {
    await restoreSystem(request);
  });

  test('REQ-017 should return preview lessons without authentication', async ({
    request,
  }) => {
    lessonApi = new LessonApi(request);
    const { resGetPreview, jsonGetPreview } =
      await lessonApi.getPreview(courseId);

    const preview = PreviewLessonsResponseSchema.parse(jsonGetPreview);

    expectStatusOK(resGetPreview);
    expect(preview.previewLessons.length).toBeLessThan(
      jsonGetPreview.totalLessons,
    );
  });

  test('REQ-017 should show more content to enrolled user than preview @logged', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader, userId } = loggedUser;
    lessonApi = new LessonApi(request, authHeader);
    courseApi = new CourseApi(request, authHeader);
    const { resGetPreview, jsonGetPreview } =
      await lessonApi.getPreview(courseId);

    const previewCount = jsonGetPreview.previewLessons.length;
    const totalLessons = jsonGetPreview.totalLessons;

    const { resEnroll, jsonEnroll } = await courseApi.enroll(courseId, userId);
    const { resGetLessons, jsonGetLessons } =
      await lessonApi.getLessons(courseId);

    expectStatusOK(resGetPreview);
    expectStatusOK(resEnroll);
    expectStatusOK(resGetLessons);
    expectSuccess(jsonEnroll);
    expect(jsonGetLessons.length).toEqual(totalLessons);
    expect(jsonGetLessons.length).toBeGreaterThan(previewCount);
  });

  test('REQ-017 should return full lesson content for enrolled user @logged', async ({
    request,
    loggedUser,
  }) => {
    const expectedZeroNumber = 0;

    const { authHeader, userId } = loggedUser;
    lessonApi = new LessonApi(request, authHeader);
    courseApi = new CourseApi(request, authHeader);

    const { resEnroll } = await courseApi.enroll(courseId, userId);
    const { resGetLessons, jsonGetLessons } =
      await lessonApi.getLessons(courseId);
    const lessonId = jsonGetLessons[expectedZeroNumber].id;
    const { resGetContent, jsonGetContent } = await lessonApi.getContent(
      courseId,
      lessonId,
    );

    const preview = LessonContentResponseSchema.parse(jsonGetContent);

    expectStatusOK(resEnroll);
    expectStatusOK(resGetLessons);
    expectStatusOK(resGetContent);
    
    if ('videoUrl' in preview.content) {
      expect(preview.content.videoUrl).toBeTruthy();
    } else if ('text' in preview.content) {
      expect(preview.content.text).toBeTruthy();
    } else if ('questions' in preview.content) {
      expect(preview.content.questions.length).toBeGreaterThan(0);
    }
  });

  test('REQ-017 should deny full lesson content without authentication', async ({
    request,
  }) => {
    lessonApi = new LessonApi(request);
    courseApi = new CourseApi(request);

    const { resGetPreview, jsonGetPreview } =
      await lessonApi.getPreview(courseId);
    const previewLessonId = jsonGetPreview.previewLessons[0].id;
    const { resGetContent, jsonGetContent } = await lessonApi.getContent(
      courseId,
      previewLessonId,
    );

    expectStatusOK(resGetPreview);
    expect(resGetContent.status()).toBe(HTTP_STATUS.BAD_REQUEST);
    expectErrorAssert(jsonGetContent);
  });
});
