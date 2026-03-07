import { testUser1 } from './user.data';

export const userProfileData = {
  firstName: 'Michael',
  lastName: 'Scott',
  email: 'michael.scott@test.test.com',
  currentPassword: testUser1.password,
  isPublic: false,
} as const;
