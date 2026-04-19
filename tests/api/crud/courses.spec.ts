import { AuthApi } from '@_src/api/auth.api';
import { CourseApi } from '@_src/api/course.api';
import { expect, test } from '@_src/fixtures/user.fixture';
import { restoreSystem } from '@_src/helper/restore';
import {
  CourseDetailsSchema,
  CourseRatingsResponseSchema,
  CoursesListResponseSchema,
} from '@_src/schemas/course.schema';
import { CourseProgressResponseSchema } from '@_src/schemas/progress.schema';
import { courseData } from '@_src/test-data/course.data';
import { testUser1 } from '@_src/test-data/user.data';
import { expectStatusOK, expectSuccess } from '@_src/utils/assertions';
import { HTTP_STATUS } from '@_src/utils/http-status';

let courseApi: CourseApi;
let authApi: AuthApi;

test.describe('Courses API', () => {
  let courseId = courseData.defaultCourseId;

  test.beforeEach(async ({ request }) => {
    await restoreSystem(request);
    courseApi = new CourseApi(request);
    authApi = new AuthApi(request);
  });

  test('should display all courses @logged', async () => {
    const { resGetAll, jsonGetAll } = await courseApi.getAll();
    const courses = CoursesListResponseSchema.parse(jsonGetAll);

    expectStatusOK(resGetAll);
    expect(courses.length).toBeGreaterThan(0);
    expect(courses[0].id).toBeTruthy();
  });

  test('should return course details by ID', async () => {
    const expectedCourseName = 'Playwright Automation Testing';
    const courseId = courseData.fourthCourseId;
    const { resGetById, jsonGetById } = await courseApi.getById(courseId);

    const course = CourseDetailsSchema.parse(jsonGetById);

    expectStatusOK(resGetById);
    expect(course.id).toBe(courseData.fourthCourseId);
    expect(course.title).toBe(expectedCourseName);
    expect(course.rating).toBeGreaterThanOrEqual(0);
    expect(course.rating).toBeLessThanOrEqual(5);
  });

  test('should not display a non-existing course', async () => {
    const courseId = courseData.nonExistingCourseId;
    const { resGetById } = await courseApi.getById(courseId);
    const responseBody = await resGetById.text();
    const responseJson = JSON.parse(responseBody);

    expect(resGetById.status()).toBe(HTTP_STATUS.NOT_FOUND);
    expect(responseJson.error.message).toBe('Course not found');
  });

  test('should display course ratings @logged', async () => {
    const courseId = courseData.secondCourseId;
    const { resGetRatings, jsonGetRatings } =
      await courseApi.getRatings(courseId);

    const ratings = CourseRatingsResponseSchema.parse(jsonGetRatings);
    ratings.forEach((r) => {
      expect(r.rating).toBeGreaterThanOrEqual(0);
      expect(r.rating).toBeLessThanOrEqual(5);
    });
    expectStatusOK(resGetRatings);
  });

  test('should display progress for user @logged', async ({
    request,
    loggedUser,
  }) => {
    const zeroAmount = 0;
    const authorizedCourseApi = new CourseApi(request, loggedUser.authHeader);
    const { resEnroll, jsonEnroll } = await authorizedCourseApi.enroll(
      courseId,
      loggedUser.userId,
    );
    const { resGetProgress, jsonGetProgress } =
      await authorizedCourseApi.getProgress(courseId);

    const progress = CourseProgressResponseSchema.parse(jsonGetProgress);

    expectSuccess(jsonEnroll);
    expectStatusOK(resGetProgress);
    expectStatusOK(resEnroll);
    expect(jsonEnroll.enrollment.progress).toEqual(zeroAmount);
    expect(progress.length).toBe(zeroAmount);
  });

  test('should not display progress for unauthorized user @logged', async () => {
    const { resLogin, jsonLogin } = await authApi.login(testUser1);
    const { resGetProgress } = await courseApi.getProgress(courseId);

    expectSuccess(jsonLogin);
    expectStatusOK(resLogin);
    expect(resGetProgress.status()).toBe(HTTP_STATUS.FORBIDDEN);
  });

  test('should not display rate when user is not at this course @logged', async ({
    request,
    loggedUser,
  }) => {
    const courseApiWithAuth = new CourseApi(request, loggedUser.authHeader);
    const payload = { rating: 4, comment: 'test' };
    const { resRate, jsonRate } = await courseApiWithAuth.rate(
      courseId,
      payload,
    );
    const expectedErrorMessage = 'User not authorized';

    expect(resRate.status()).toBe(HTTP_STATUS.FORBIDDEN);
    expect(jsonRate.error.message).toBe(expectedErrorMessage);
  });
});
