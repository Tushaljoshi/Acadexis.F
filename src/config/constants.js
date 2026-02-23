export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',
};

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  STUDENTS: '/students',
  STUDENT_ADD: '/students/add',
  STUDENT_EDIT: '/students/edit/:id',
  STUDENT_VIEW: '/students/:id',
  TEACHERS: '/teachers',
  TEACHER_ADD: '/teachers/add',
  TEACHER_EDIT: '/teachers/edit/:id',
  TEACHER_SALARY: '/teachers/salary',
  CLASSES: '/classes',
  SUBJECTS: '/subjects',
  ATTENDANCE: '/attendance',
  ATTENDANCE_MARK: '/attendance/mark',
  ATTENDANCE_REPORT: '/attendance/report',
  EXAMS: '/exams',
  EXAM_ADD: '/exams/add',
  EXAM_EDIT: '/exams/edit/:id',
  RESULTS: '/results',
  REPORT_CARD: '/results/report-card/:id',
  FEES: '/fees',
  FEE_STRUCTURE: '/fees/structure',
  FEE_PAYMENT: '/fees/payment',
  NOTICES: '/notices',
  NOTICE_ADD: '/notices/add',
  NOTICE_EDIT: '/notices/edit/:id',
  TIMETABLE: '/timetable',
  TIMETABLE_CREATE: '/timetable/create',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  SUPPORT: '/support',
};

export const PERMISSIONS = {
  [ROLES.ADMIN]: ['*'], 
  [ROLES.TEACHER]: [
    'view_students',
    'view_attendance',
    'mark_attendance',
    'view_exams',
    'add_marks',
    'view_notices',
    'view_timetable',
  ],
  [ROLES.STUDENT]: [
    'view_own_profile',
    'view_own_attendance',
    'view_own_results',
    'view_own_fees',
    'view_notices',
    'view_timetable',
  ],
  [ROLES.PARENT]: [
    'view_child_profile',
    'view_child_attendance',
    'view_child_results',
    'view_child_fees',
    'view_notices',
  ],
};

export const EXAM_TYPES = [
  'Unit Test',
  'Mid-term',
  'Final',
  'Quiz',
  'Assignment',
];

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
};

export const TEACHER_ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LEAVE: 'leave',
};

export const FEE_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  OVERDUE: 'overdue',
  PARTIAL: 'partial', 
};

export const GRADE_SCALE = [
  { min: 90, max: 100, grade: 'A+', points: 4.0 },
  { min: 80, max: 89, grade: 'A', points: 3.5 },
  { min: 70, max: 79, grade: 'B+', points: 3.0 },
  { min: 60, max: 69, grade: 'B', points: 2.5 },
  { min: 50, max: 59, grade: 'C+', points: 2.0 },
  { min: 40, max: 49, grade: 'C', points: 1.5 },
  { min: 0, max: 39, grade: 'F', points: 0.0 },
];
