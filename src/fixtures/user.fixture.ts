import { prepareRandomUser } from '@_src/factory/user.factory';
import { createUserAndLogin } from '@_src/helper/user';
import { TestUser } from '@_src/types/test-user.type';
import { test as base } from '@playwright/test';

export const test = base.extend<{ loggedUser: TestUser }>({
  loggedUser: async ({ request }, use, testInfo) => {
    const id = `${testInfo.workerIndex}_${Date.now()}_${Math.random().toString(10).slice(2, 6)}`;
    const username = `u${id}`.toLowerCase().slice(0, 20);
    const email = `${username}@e2e.test`;

    const userData = prepareRandomUser({
      username,
      email,
    });

    const user = await createUserAndLogin(request, userData);

    await use(user);
  },
});

export { expect } from '@playwright/test';
