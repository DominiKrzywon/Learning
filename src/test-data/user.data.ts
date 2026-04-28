import { USER_NAME, USER_PASSWORD } from '@_config/env.config';
import { LoginUserModel } from '@_src/models/user.model';

export const testUserApi: LoginUserModel = {
  username: USER_NAME,
  password: USER_PASSWORD,
};

export const testUserIncorrectApi: LoginUserModel = {
  username: 'invalid_user',
  password: USER_PASSWORD,
};

export const testUserLearningUI: LoginUserModel = {
  username: USER_NAME,
  password: USER_PASSWORD,
};

export const testUserInvalidPasswordUI: LoginUserModel = {
  username: USER_NAME,
  password: 'invalid_password',
};

export const testUserInvalidUsernameUI: LoginUserModel = {
  username: 'invalid_username',
  password: USER_PASSWORD,
};
