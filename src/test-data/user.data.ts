import { USER_NAME, USER_PASSWORD } from '@_config/env.config';
import { LoginUserModel } from '@_src/models/user.model';

export const testUser1: LoginUserModel = {
  username: USER_NAME,
  password: USER_PASSWORD,
};

export const testUserIncorrect: LoginUserModel = {
  username: 'invalid_user',
  password: USER_PASSWORD,
};
