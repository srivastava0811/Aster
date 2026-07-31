export interface User {
  id: string;
  email: string;
}

export interface Course {
  id: string;
  userId: string;
  name: string;
  colorCode: string;
  assignmentCount?: number;
  createdAt?: string;
}

export interface CreateCourseRequest {
  name: string;
  colorCode: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  courseName: string;
  courseColorCode: string;
  title: string;
  dueDate: string;
  rawInjectedText?: string;
  isCompleted?: boolean;
  createdAt?: string;
}

export interface ParseAssignmentRequest {
  courseId: string;
  rawText: string;
}

export interface ParseAssignmentResponse {
  parsedTitle: string;
  parsedDueDate: string;
  confidenceScore: number;
  extractedNotes?: string;
}

export interface CreateAssignmentRequest {
  courseId: string;
  title: string;
  dueDate: string;
  rawInjectedText?: string;
  isCompleted?: boolean;
}

export interface AuthResponse {
  token: string;
  email: string;
  userId: string;
}

export interface UserSettings {
  email: string;
  semesterStartDate?: string;
  semesterEndDate?: string;
  notificationLeadTimeHours: number;
  weeklyDigestEnabled: boolean;
  defaultDueTime?: string;
  strictValidationEnabled: boolean;
  assignmentFocusLimit: number;
}

export interface UpdateUserSettingsRequest {
  semesterStartDate?: string;
  semesterEndDate?: string;
  notificationLeadTimeHours: number;
  weeklyDigestEnabled: boolean;
  defaultDueTime?: string;
  strictValidationEnabled: boolean;
  assignmentFocusLimit: number;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserDataExport {
  exportedAt: string;
  userSettings: UserSettings;
  courses: Array<{
    id: string;
    name: string;
    colorCode: string;
    createdAt: string;
    assignments: Array<{
      id: string;
      title: string;
      dueDate: string;
      rawInjectedText?: string;
      createdAt: string;
    }>;
  }>;
}
