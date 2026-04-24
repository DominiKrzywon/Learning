import { USER_NAME, USER_PASSWORD } from '@_config/env.config';
import { LoginUserModel } from '@_src/ui/models/user.model';

export const testUserLearning: LoginUserModel = {
  username: USER_NAME,
  password: USER_PASSWORD,
};

export const testUserInvalidPassword: LoginUserModel = {
  username: USER_NAME,
  password: 'invalid_password',
};

export const testUserInvalidUsername: LoginUserModel = {
  username: 'invalid_username',
  password: USER_PASSWORD,
};
