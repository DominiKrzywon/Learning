import { AuthApi } from '@_src/api/auth.api';
import { CourseApi } from '@_src/api/course.api';
import { expect, test } from '@_src/fixtures/user.fixture';
import { restoreSystem } from '@_src/helper/restore';
import { CourseRatingModel } from '@_src/models/course.model';
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

  test('should display all courses @logged', async ({ request }) => {
    const { resGetAll, jsonGetAll } = await courseApi.getAll();
    const firstCourse = jsonGetAll[0];

    expectStatusOK(resGetAll);
    expect(Array.isArray(jsonGetAll)).toBe(true);
    expect(jsonGetAll.length).toBeGreaterThan(0);
    expect(firstCourse.id).toBeTruthy();
    expect(['Beginner', 'Intermediate', 'Advanced']).toContain(
      firstCourse.level,
    );
  });

  test('should return course details by ID', async ({ request }) => {
    const courseId = courseData.fourthCourseId;
    const { resGetById, jsonGetById } = await courseApi.getById(courseId);

    expectStatusOK(resGetById);
    expect(jsonGetById).toMatchObject({
      id: 4,
      title: 'Playwright Automation Testing',
      description:
        'Learn end-to-end testing with Playwright. Automate browser interactions, test web applications, and write reliable tests.',
      thumbnail: '..\\data\\learning\\courses\\playwright.jpg',
      instructor: 'John Doe',
      instructorId: 2,
      level: 'Intermediate',
      tags: ['Playwright', 'Testing', 'Automation'],
      prerequisites: ['JavaScript', 'Testing Basics'],
      price: 129.99,
      learningObjectives: [
        'Master Playwright automation testing',
        'Automate browser interactions',
        'Write reliable end-to-end tests',
        'Test web applications effectively',
        'Debug and optimize test scripts',
        'Implement testing best practices',
      ],
      totalHours: 2.2,
      duration: '2.2 hour(s)',
    });
    expect(typeof jsonGetById.students).toBe('number');
    expect(typeof jsonGetById.rating).toBe('number');
  });

  test('should not display a non-existing course', async ({ request }) => {
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

    expectStatusOK(resGetRatings);
    expect(Array.isArray(jsonGetRatings)).toBe(true);
    jsonGetRatings.forEach((rating: CourseRatingModel) => {
      expect(rating.rating).toBeGreaterThanOrEqual(0);
      expect(rating.rating).toBeLessThanOrEqual(5);
      expect(typeof rating.comment).toBe('string');
      expect(rating.createdAt).toBeTruthy();
      expect(rating.userInfo).toHaveProperty('name');
    });
  });

  test('should display progress for user @logged', async ({
    request,
    loggedUser,
  }) => {
    const zeroAmount = 0;
    const courseApi = new CourseApi(request, loggedUser.authHeader);
    const { resEnroll, jsonEnroll } = await courseApi.enroll(
      courseId,
      loggedUser.userId,
    );
    const { resGetProgress, jsonGetProgress } =
      await courseApi.getProgress(courseId);

    expectSuccess(jsonEnroll);
    expect(jsonEnroll.enrollment.progress).toEqual(zeroAmount);
    expectStatusOK(resGetProgress);
    expectStatusOK(resEnroll);
    expect(Array.isArray(jsonGetProgress)).toBe(true);
    expect(jsonGetProgress.length).toBe(zeroAmount);
  });

  test('should not display progress for unauthorized user @logged', async () => {
    const { resLogin, jsonLogin } = await authApi.login(testUser1);
    const { resGetProgress } = await courseApi.getProgress(courseId);

    expectSuccess(jsonLogin);
    expectStatusOK(resLogin);
    expect(resGetProgress).toBeDefined();
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
