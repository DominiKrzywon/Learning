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

    await requestContext.post('/api/learning/auth/register', {
      data: {
        username: USER_NAME,
        password: USER_PASSWORD,
        email: USER_EMAIL,
        firstName: 'Auto',
        lastName: 'User',
        avatar: AVATAR,
      },
    });

    const loginResponse = await requestContext.post(
      '/api/learning/auth/login',
      {
        data: {
          username: USER_NAME,
          password: USER_PASSWORD,
        },
      },
    );

    if (!loginResponse.ok()) {
      throw new Error(`Login failed: ${loginResponse.status()}`);
    }

    const storage = await requestContext.storageState();

    fs.mkdirSync('tmp', { recursive: true });
    fs.writeFileSync(STORAGE_STAGE, JSON.stringify(storage));

    console.log('Session saved to:', STORAGE_STAGE);
  } catch (err) {
    console.error(err);
    throw new Error(`Failed to prepare test user for ${baseURL}`);
  } finally {
    await requestContext.dispose();
  }
}

export default globalSetup;
