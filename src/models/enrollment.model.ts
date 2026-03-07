export interface EnrollmentModel {
  id: number;
  userId: number;
  courseId: number;
  enrollmentDate: string;
  lastAccessed: string;
  progress: number;
  completed: boolean;
  certificateIssued?: boolean;
  completionDate?: string;
  paidAmount?: number;
}
