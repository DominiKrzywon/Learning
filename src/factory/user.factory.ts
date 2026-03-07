import { AVATAR } from '@_config/env.config';
import { RegisterUserModel } from '@_src/models/user.model';
import { faker } from '@faker-js/faker';

export function prepareRandomUser(
  overrides?: Partial<RegisterUserModel>,
): RegisterUserModel {
  const registerUserData: RegisterUserModel = {
    username: faker.person.firstName().toLowerCase() + faker.string.numeric(4),
    password: faker.internet.password(),
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    avatar: AVATAR,
    ...overrides
  }; 
  return registerUserData;
}
