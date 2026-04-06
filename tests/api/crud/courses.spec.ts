import { AuthApi } from '@_src/api/auth.api';
import { CourseApi } from '@_src/api/course.api';
import { expect, test } from '@_src/fixtures/user.fixture';
import { restoreSystem } from '@_src/helper/restore';
import { CourseRatingModel } from '@_src/models/course.model';
import { courseData } from '@_src/test-data/course.data';
import { testUser1 } from '@_src/test-data/user.data';
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
    const { responseAll, jsonAll } = await courseApi.getAll();
    const firstCourse = jsonAll[0];

    expect(responseAll.status()).toBe(HTTP_STATUS.OK);
    expect(Array.isArray(jsonAll)).toBe(true);
    expect(jsonAll.length).toBeGreaterThan(0);
    expect(firstCourse.id).toBeTruthy();
    expect(['Beginner', 'Intermediate', 'Advanced']).toContain(
      firstCourse.level,
    );
  });

  test('should return course details by ID', async ({ request }) => {
    const courseId = courseData.fourthCourseId;
    const { responseById, jsonById } = await courseApi.getById(courseId);

    expect(responseById.status()).toBe(HTTP_STATUS.OK);
    expect(jsonById).toMatchObject({
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
    expect(typeof jsonById.students).toBe('number');
    expect(typeof jsonById.rating).toBe('number');
  });

  test('should not display a non-existing course', async ({ request }) => {
    const courseId = courseData.nonExistingCourseId;
    const { responseById } = await courseApi.getById(courseId);
    const responseBody = await responseById.text();
    const responseJson = JSON.parse(responseBody);

    expect(responseById.status()).toBe(HTTP_STATUS.NOT_FOUND);
    expect(responseJson.error.message).toBe('Course not found');
  });

  test('should display course ratings @logged', async () => {
    const courseId = courseData.secondCourseId;
    const { responseRating, jsonRating } = await courseApi.getRatings(courseId);

    expect(responseRating.status()).toBe(HTTP_STATUS.OK);
    expect(Array.isArray(jsonRating)).toBe(true);
    jsonRating.forEach((rating: CourseRatingModel) => {
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
    const { resEnroll, jsonEnroll } = await courseApi.enrollCourse(
      courseId,
      loggedUser.userId,
    );
    const { responseProgress, jsonProgress } =
      await courseApi.getProgress(courseId);

    expect(jsonEnroll.success).toBe(true);
    expect(jsonEnroll.enrollment.progress).toEqual(0);
    expect(responseProgress.status()).toBe(HTTP_STATUS.OK);
    expect(resEnroll.status()).toBe(HTTP_STATUS.OK);
    expect(Array.isArray(jsonProgress)).toBe(true);
    expect(jsonProgress.length).toBe(zeroAmount);
  });

  test('should not display progress for unauthorized user @logged', async () => {
    const { resLogin, jsonLogin } = await authApi.login(testUser1);
    const { responseProgress } = await courseApi.getProgress(courseId);

    expect(jsonLogin.success).toBe(true);
    expect(resLogin.status()).toBe(HTTP_STATUS.OK);
    expect(responseProgress).toBeDefined();
    expect(responseProgress.status()).toBe(HTTP_STATUS.FORBIDDEN);
  });

  test('should not display rate when user is not at this course @logged', async ({
    request,
    loggedUser,
  }) => {
    const courseApiWithAuth = new CourseApi(request, loggedUser.authHeader);
    const payload = { rating: 4, comment: 'test' };
    const { responseRate, jsonRate } = await courseApiWithAuth.rate(
      courseId,
      payload,
    );
    const expectedErrorMessage = 'User not authorized';

    expect(responseRate.status()).toBe(HTTP_STATUS.FORBIDDEN);
    expect(jsonRate.error.message).toBe(expectedErrorMessage);
  });
});
