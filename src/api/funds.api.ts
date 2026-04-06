import { APIRequestContext } from '@playwright/test';

export class FundsApi {
  constructor(
    private request: APIRequestContext,
    private authHeader?: string,
  ) {}
}
