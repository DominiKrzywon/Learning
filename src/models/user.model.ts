export interface LoginUserModel {
  username: string;
  password: string;
}

export interface RegisterUserModel {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
}

export interface UserProfileResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
  isPublic: boolean;
}
