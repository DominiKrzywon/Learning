import { createUserAndLogin } from '@_src/helper/user';
import { TestUser } from '@_src/types/test-user.type';
import { test as base } from '@playwright/test';

export const test = base.extend<{ loggedUser: TestUser }>({
  loggedUser: async ({ request }, use) => {
    const user = await createUserAndLogin(request);

    await use(user);
  },
});

export { expect } from '@playwright/test';
