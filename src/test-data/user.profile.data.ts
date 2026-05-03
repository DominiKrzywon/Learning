export function userProfileData(currentPassword: string) {
  return {
    firstName: 'Michael',
    lastName: 'Scott',
    email: 'michael.scott@test.test.com',
    currentPassword,
    isPublic: false,
  } as const;
}

export const invalidPassword = 'badPassword123';
