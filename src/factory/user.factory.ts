import { AVATAR } from '@_config/env.config';
import { RegisterUserModel } from '@_src/models/user.model';
import { faker } from '@faker-js/faker';

function cleanString(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, '');
}

export function prepareRandomUser(
  overrides?: Partial<RegisterUserModel>,
): RegisterUserModel {
  const rawFirst = faker.person.firstName();
  const rawLast = faker.person.lastName();

  const firstName = cleanString(rawFirst) || 'Test';
  const lastName = cleanString(rawLast) || 'User';

  const base = cleanString(rawFirst).toLowerCase() || 'user';
  const unique = faker.string.alphanumeric(6).toLowerCase();

  const username = (base + unique).slice(0, 10);
  const email = `${username}@test.com`;

  const registerUserData: RegisterUserModel = {
    username,
    password: faker.internet.password(),
    email,
    firstName,
    lastName,
    avatar: AVATAR,
    ...overrides,
  };
  return registerUserData;
}
