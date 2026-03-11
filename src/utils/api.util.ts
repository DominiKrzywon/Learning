export const apiUrls = {
  healthUrl: '/api/health',
  registerUrl: '/api/learning/auth/register',
  loginUrl: '/api/learning/auth/login',
  authStatusUrl: '/api/learning/auth/status',
  coursesUrl: '/api/learning/courses',
  courseSearchUrl: '/api/learning/courses/search',

  courseByIdUrl: (courseId: number) => `/api/learning/courses/${courseId}`,
  courseRatingsUrl: (courseId: number) =>
    `/api/learning/courses/${courseId}/ratings`,
  courseProgressUrl: (courseId: number) =>
    `/api/learning/courses/${courseId}/progress`,
  courseRateUrl: (courseId: number) => `/api/learning/courses/${courseId}/rate`,

  courseEnrollUrl: (courseId: number) =>
    `/api/learning/courses/${courseId}/enroll`,

  courseLessonsUrl: (courseId: number) =>
    `/api/learning/courses/${courseId}/lessons`,
  courseLessonsTitlesUrl: (courseId: number) =>
    `/api/learning/courses/${courseId}/lessons/titles`,
  courseLessonsPreviewUrl: (courseId: number) =>
    `/api/learning/courses/${courseId}/lessons/preview`,
  lessonContentUrl: (courseId: number, lessonId: number) =>
    `/api/learning/courses/${courseId}/lessons/${lessonId}/content`,
  lessonCompleteUrl: (courseId: number, lessonId: number) =>
    `/api/learning/courses/${courseId}/lessons/${lessonId}/complete`,

  getUserProfileUrl: (userId: number) => `/api/learning/users/${userId}`,
  putUserProfileUrl: (userId: number) =>
    `/api/learning/users/${userId}/profile`,
  updateUserPasswordUrl: (userId: number) =>
    `/api/learning/users/${userId}/password`,
  deactivateUserUrl: (userId: number) =>
    `/api/learning/users/${userId}/deactivate`,
};
