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
  ): Promise<{ resGetLessons: APIResponse; jsonGetLessons: any }> {
    const resGetLessons = await this.request.get(
      apiUrls.courseLessonsUrl(courseId),
      { headers: { Authorization: this.authHeader! } },
    );
    const jsonGetLessons = await resGetLessons.json();

    return { resGetLessons, jsonGetLessons };
  }

  async getTitles(courseId: number): Promise<{
    resGetTitles: APIResponse;
    jsonGetTitles: { id: number; title: string }[];
  }> {
    const resGetTitles = await this.request.get(
      apiUrls.courseLessonsTitlesUrl(courseId),
    );
    const jsonGetTitles = await resGetTitles.json();

    return { resGetTitles, jsonGetTitles };
  }

  async getPreview(courseId: number): Promise<{
    resGetPreview: APIResponse;
    jsonGetPreview: { previewLessons: LessonModel[]; totalLessons: number };
  }> {
    const resGetPreview = await this.request.get(
      apiUrls.courseLessonsPreviewUrl(courseId),
    );
    const jsonGetPreview = await resGetPreview.json();

    return { resGetPreview, jsonGetPreview };
  }

  async getContent(
    courseId: number,
    lessonId: number,
  ): Promise<{
    resGetContent: APIResponse;
    jsonGetContent: any;
  }> {
    const resGetContent = await this.request.get(
      apiUrls.lessonContentUrl(courseId, lessonId),
      { headers: { Authorization: this.authHeader! } },
    );
    const jsonGetContent = await resGetContent.json();

    return { resGetContent, jsonGetContent };
  }

  async complete(
    courseId: number,
    lessonId: number,
    userId: number,
  ): Promise<{
    resComplete: APIResponse;
    jsonComplete: { success: boolean };
  }> {
    const resComplete = await this.request.post(
      apiUrls.lessonCompleteUrl(courseId, lessonId),
      { data: { userId }, headers: { Authorization: this.authHeader! } },
    );
    const jsonComplete = await resComplete.json();

    return { resComplete, jsonComplete };
  }
}
