import { CreateRatingPayload } from '@_src/models/course.model';
import { apiUrls } from '@_src/utils/api.util';
import { APIRequestContext, APIResponse } from '@playwright/test';

export class CourseApi {
  constructor(
    private request: APIRequestContext,
    private authHeader?: string,
  ) {}

  async getAll(): Promise<{ resGetAll: APIResponse; jsonGetAll: any }> {
    const resGetAll = await this.request.get(apiUrls.coursesUrl);
    const jsonGetAll = await resGetAll.json();
    return { resGetAll, jsonGetAll };
  }

  async getById(
    courseId: number,
  ): Promise<{ resGetById: APIResponse; jsonGetById: any }> {
    const resGetById = await this.request.get(apiUrls.courseByIdUrl(courseId));
    const jsonGetById = await resGetById.json();
    return { resGetById, jsonGetById };
  }

  async getRatings(
    courseId: number,
  ): Promise<{ resGetRatings: APIResponse; jsonGetRatings: any }> {
    const resGetRatings = await this.request.get(
      apiUrls.courseRatingsUrl(courseId),
    );
    const jsonGetRatings = await resGetRatings.json();
    return { resGetRatings, jsonGetRatings };
  }

  async rate(
    courseId: number,
    payload: CreateRatingPayload,
  ): Promise<{ resRate: APIResponse; jsonRate: any }> {
    const resRate = await this.request.post(apiUrls.courseRateUrl(courseId), {
      data: payload,
      headers: { Authorization: this.authHeader! },
    });
    const jsonRate = await resRate.json();

    return { resRate, jsonRate };
  }

  async enroll(
    courseId: number,
    userId: number,
  ): Promise<{ resEnroll: APIResponse; jsonEnroll: any }> {
    const resEnroll = await this.request.post(
      apiUrls.courseEnrollUrl(courseId),
      {
        data: { userId },
        headers: { Authorization: this.authHeader! },
      },
    );
    const jsonEnroll = await resEnroll.json();
    return { resEnroll, jsonEnroll };
  }

  async getProgress(
    courseId: number,
  ): Promise<{ resGetProgress: APIResponse; jsonGetProgress: any }> {
    const resGetProgress = await this.request.get(
      apiUrls.courseProgressUrl(courseId),
      { headers: { Authorization: this.authHeader! } },
    );
    const jsonGetProgress = await resGetProgress.json();

    return { resGetProgress, jsonGetProgress };
  }
}
