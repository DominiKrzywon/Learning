export interface CourseModel {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  instructor: string;
  instructorId: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  prerequisites: string[];
  price: number;
  learningObjectives: string[];
  students: number;
  rating: number;
  totalHours: number;
  duration: string;
}

export interface CourseRatingModel {
  userId: number;
  courseId: number;
  rating: number;
  comment: string;
  createdAt: string;
  userInfo: {
    name: string;
    avatar: string;
    id: number;
  };
}

export interface CreateRatingPayload {
  rating: number;
  comment: string;
}
