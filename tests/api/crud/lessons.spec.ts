import { expect, test } from '@_src/fixtures/user.fixture';
import { enrollOnLesson } from '@_src/helper/enroll-lesson';
import { restoreSystem } from '@_src/helper/restore';
import {
  LessonModel,
  QuizContent,
  ReadingContent,
} from '@_src/models/lessons.model';
import { courseData } from '@_src/test-data/course.data';
import { apiUrls } from '@_src/utils/api.util';
import { HTTP_STATUS } from '@_src/utils/http-status';

test.describe('Lessons API', () => {
  const courseId = courseData.defaultCourseId;

  test.beforeEach(async ({ request }) => {
    await restoreSystem(request);
  });

  test('unauthorized user cannot take a lesson', async ({ request }) => {
    const response = await request.get(apiUrls.courseLessonsUrl(courseId));
    const responseJson = await response.json();

    expect(response.status()).toBe(HTTP_STATUS.FORBIDDEN);
    expect(responseJson.error.message).toBe(
      'Not authorized to access this course',
    );
  });

  test('should get lessons with authorize user', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader, userId } = loggedUser;

    await enrollOnLesson(request, authHeader, userId, courseId);

    const response = await request.get(apiUrls.courseLessonsUrl(courseId), {
      headers: { Authorization: authHeader },
    });
    const responseJson = await response.json();

    expect(response.status()).toBe(HTTP_STATUS.OK);
    expect(Array.isArray(responseJson)).toBe(true);
    expect(responseJson.length).toBeGreaterThan(1);

    responseJson.forEach((lesson: LessonModel) => {
      expect(lesson.id).toBeGreaterThanOrEqual(1);
      expect(typeof lesson.title).toBe('string');
      expect(typeof lesson.completed).toBe('boolean');

      if (lesson.duration !== undefined) {
        expect(typeof lesson.duration).toBe('string');
      }

      if (lesson.type === 'video') {
        expect(lesson.content).toHaveProperty('videoUrl');
        expect(lesson.content).toHaveProperty('transcript');
      }
      if (lesson.type === 'reading') {
        const readingContent = lesson.content as ReadingContent;
        expect(lesson.content).toHaveProperty('text');
        expect(Array.isArray(readingContent.resources)).toBe(true);
      }
      if (lesson.type === 'quiz') {
        const quizContent = lesson.content as QuizContent;
        expect(Array.isArray(quizContent.questions)).toBe(true);
        expect(quizContent.questions[0]).toHaveProperty('question');
        expect(quizContent.questions[0]).toHaveProperty('options');
        expect(typeof quizContent.questions[0].correct).toBe('number');
      }
    });
  });

  test('take a title of lessons', async ({ request }) => {
    const response = await request.get(
      apiUrls.courseLessonsTitlesUrl(courseId),
    );
    const responseJson = await response.json();

    expect(response.status()).toBe(HTTP_STATUS.OK);
    expect(Array.isArray(responseJson)).toBe(true);
    responseJson.forEach((title: { id: number; title: string }) => {
      expect(typeof title.id).toBe('number');
      expect(typeof title.title).toBe('string');
    });
  });

  test('take a preview of lessons', async ({ request }) => {
    const response = await request.get(
      apiUrls.courseLessonsPreviewUrl(courseId),
    );
    const responseJson = await response.json();

    expect(response.status()).toBe(HTTP_STATUS.OK);
    expect(Array.isArray(responseJson.previewLessons)).toBe(true);
    expect(responseJson.previewLessons.length).toBeGreaterThan(1);
    expect(typeof responseJson.totalLessons).toBe('number');
    expect(responseJson.previewLessons.length).toBeLessThanOrEqual(
      responseJson.totalLessons,
    );
  });

  test('should get lesson content with authorize user', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader, userId } = loggedUser;

    await enrollOnLesson(request, authHeader, userId, courseId);

    const response = await request.get(apiUrls.courseLessonsUrl(courseId), {
      headers: { Authorization: authHeader },
    });
    const responseJson = await response.json();
    const lessonId = responseJson[0].id;

    const getContext = await request.get(
      apiUrls.lessonContentUrl(courseId, lessonId),
      {
        headers: { Authorization: authHeader },
      },
    );

    const getContextJson = await getContext.json();

    expect(response.status()).toBe(HTTP_STATUS.OK);
    expect(typeof getContextJson.content.videoUrl).toBe('string');
    expect(typeof getContextJson.content.transcript).toBe('string');
  });

  test('check the lesson as completed as an authorize user', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader, userId } = loggedUser;

    await enrollOnLesson(request, authHeader, userId, courseId);

    const response = await request.get(apiUrls.courseLessonsUrl(courseId), {
      headers: { Authorization: authHeader },
    });
    const responseJson = await response.json();
    const lessonId = responseJson[0].id;

    const completeResponse = await request.post(
      apiUrls.lessonCompleteUrl(courseId, lessonId),
      {
        headers: { Authorization: authHeader },
        data: { userId },
      },
    );

    const completeJson = await completeResponse.json();

    expect(completeResponse.status()).toBe(HTTP_STATUS.OK);
    expect(completeJson.success).toBe(true);
  });
});
