import {
  AVATAR,
  USER_EMAIL,
  USER_NAME,
  USER_PASSWORD,
} from '@_config/env.config';
import { STORAGE_STAGE } from '@_pw-config';
import { FullConfig, request } from '@playwright/test';
import * as fs from 'fs';

async function globalSetup(config: FullConfig): Promise<void> {
  if (fs.existsSync(STORAGE_STAGE)) {
    fs.unlinkSync(STORAGE_STAGE);
  }

  const baseURL = config.projects[0].use.baseURL;
  const requestContext = await request.newContext({ baseURL });

  try {
    const response = await requestContext.get(baseURL!);
    if (!response.ok()) {
      throw new Error(`Health check failed for ${baseURL}`);
    }

    const registerResponse = await requestContext.post(
      '/api/learning/auth/register',
      {
        data: {
          username: USER_NAME,
          password: USER_PASSWORD,
          email: USER_EMAIL,
          firstName: 'Auto',
          lastName: 'User',
          avatar: AVATAR,
        },
      },
    );

    if (![200, 400, 422].includes(registerResponse.status())) {
      throw new Error(
        `Unable to prepare shared user ${USER_NAME}, status ${registerResponse.status()}`,
      );
    }
  } catch {
    throw new Error(`Failed to connect to ${baseURL}!`);
  } finally {
    await requestContext.dispose();
  }
}

export default globalSetup;
