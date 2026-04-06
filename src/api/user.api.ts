import { APIRequestContext } from '@playwright/test';

export class UserApi {
  constructor(
    private request: APIRequestContext,
    private authHeader?: string,
  ) {}
}
