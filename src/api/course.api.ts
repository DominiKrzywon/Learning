import { CreateRatingPayload } from '@_src/models/course.model';
import { ProgressModel } from '@_src/models/progress.model';
import { apiUrls } from '@_src/utils/api.util';
import { APIRequestContext, APIResponse } from '@playwright/test';

export class CourseApi {
  constructor(
    private request: APIRequestContext,
    private authHeader?: string,
  ) {}

  async getAll(): Promise<{ responseAll: APIResponse; jsonAll: any }> {
    const responseAll = await this.request.get(apiUrls.coursesUrl);
    const jsonAll = await responseAll.json();
    return { responseAll, jsonAll };
  }

  async getById(
    courseId: number,
  ): Promise<{ responseById: APIResponse; jsonById: any }> {
    const responseById = await this.request.get(
      apiUrls.courseByIdUrl(courseId),
    );
    const jsonById = await responseById.json();
    return { responseById, jsonById };
  }

  async getRatings(
    courseId: number,
  ): Promise<{ responseRating: APIResponse; jsonRating: any }> {
    const responseRating = await this.request.get(
      apiUrls.courseRatingsUrl(courseId),
    );
    const jsonRating = await responseRating.json();
    return { responseRating, jsonRating };
  }

  async rate(
    courseId: number,
    payload: CreateRatingPayload,
  ): Promise<{ response: APIResponse; json: any }> {
    const response = await this.request.post(apiUrls.courseRateUrl(courseId), {
      data: payload,
      headers: { Authorization: this.authHeader! },
    });
    const json = await response.json();

    return { response, json };
  }

  async enrollCourse(
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
  ): Promise<{ responseProgress: APIResponse; jsonProgress: ProgressModel[] }> {
    const responseProgress = await this.request.get(
      apiUrls.courseProgressUrl(courseId),
      { headers: { Authorization: this.authHeader! } },
    );
    const jsonProgress = await responseProgress.json();

    return { responseProgress, jsonProgress };
  }
}
