import { LessonModel } from '@_src/models/lessons.model';
import { apiUrls } from '@_src/utils/api.util';
import { APIRequestContext, APIResponse } from '@playwright/test';

export class LessonApi {
  constructor(
    private request: APIRequestContext,
    private authHeader?: string,
  ) {}

  async getLessons(
    courseId: number,
  ): Promise<{ responseLessons: APIResponse; jsonLessons: any }> {
    const responseLessons = await this.request.get(
      apiUrls.courseLessonsUrl(courseId),
      { headers: { Authorization: this.authHeader! } },
    );
    const jsonLessons = await responseLessons.json();

    return { responseLessons, jsonLessons };
  }

  async getTitles(courseId: number): Promise<{
    responseTitles: APIResponse;
    jsonTitles: { id: number; title: string }[];
  }> {
    const responseTitles = await this.request.get(
      apiUrls.courseLessonsTitlesUrl(courseId),
    );
    const jsonTitles = await responseTitles.json();

    return { responseTitles, jsonTitles };
  }

  async getPreview(courseId: number): Promise<{
    responsePreview: APIResponse;
    jsonPreview: { previewLessons: LessonModel[]; totalLessons: number };
  }> {
    const responsePreview = await this.request.get(
      apiUrls.courseLessonsPreviewUrl(courseId),
    );
    const jsonPreview = await responsePreview.json();

    return { responsePreview, jsonPreview };
  }

  async getContent(
    courseId: number,
    lessonId: number,
  ): Promise<{
    responseContent: APIResponse;
    jsonContent: any;
  }> {
    const responseContent = await this.request.get(
      apiUrls.lessonContentUrl(courseId, lessonId),
      { headers: { Authorization: this.authHeader! } },
    );
    const jsonContent = await responseContent.json();

    return { responseContent, jsonContent };
  }

  async complete(
    courseId: number,
    lessonId: number,
    userId: number,
  ): Promise<{
    responseComplete: APIResponse;
    jsonComplete: { success: boolean };
  }> {
    const responseComplete = await this.request.post(
      apiUrls.lessonCompleteUrl(courseId, lessonId),
      { data: { userId }, headers: { Authorization: this.authHeader! } },
    );
    const jsonComplete = await responseComplete.json();

    return { responseComplete, jsonComplete };
  }
}
