import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import ProtectedRoute from './guards/ProtectedRoute';
import Layout from './components/Layout';
import LoginForm from './components/LoginForm';
import Dashboard from './pages/Dashboard';
import { ROUTES, ROLES } from './config/constants';
import StudentsList from './pages/students/StudentsList';
import StudentForm from './pages/students/StudentForm';
import StudentView from './pages/students/StudentView';
import TeachersList from './pages/teachers/TeachersList';
import TeacherForm from './pages/teachers/TeacherForm';
import TeacherSalary from './pages/teachers/TeacherSalary';
import ClassesList from './pages/classes/ClassesList';
import SubjectsList from './pages/subjects/SubjectsList';
import AttendanceMark from './pages/attendance/AttendanceMark';
import ExamsList from './pages/exams/ExamsList';
import ExamCreate from './pages/exams/ExamCreate';
import FeesList from './pages/fees/FeesList';
import NoticesList from './pages/notices/NoticesList';
import NoticeForm from './pages/notices/NoticeForm';
import TimetableList from './pages/timetable/TimetableList';
import TimetableCreate from './pages/timetable/TimetableCreate';
import Profile from './pages/Profile';
import SupportPage from './pages/support/SupportPage';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route
          path={ROUTES.LOGIN}
          element={isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <LoginForm />}
        />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route
            path={ROUTES.STUDENTS}
            element={
              <ProtectedRoute requiredRole={ROLES.ADMIN}>
                <StudentsList />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.STUDENT_ADD}
            element={
              <ProtectedRoute requiredRole={ROLES.ADMIN}>
                <StudentForm />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.STUDENT_EDIT}
            element={
              <ProtectedRoute requiredRole={ROLES.ADMIN}>
                <StudentForm />
              </ProtectedRoute>
            }
          />
          <Route path={ROUTES.STUDENT_VIEW} element={<StudentView />} />

          <Route
            path={ROUTES.TEACHERS}
            element={
              <ProtectedRoute requiredRole={ROLES.ADMIN}>
                <TeachersList />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.TEACHER_ADD}
            element={
              <ProtectedRoute requiredRole={ROLES.ADMIN}>
                <TeacherForm />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.TEACHER_EDIT}
            element={
              <ProtectedRoute requiredRole={ROLES.ADMIN}>
                <TeacherForm />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.TEACHER_SALARY}
            element={
              <ProtectedRoute requiredRole={ROLES.ADMIN}>
                <TeacherSalary />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.CLASSES}
            element={
              <ProtectedRoute requiredRole={ROLES.ADMIN}>
                <ClassesList />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.SUBJECTS}
            element={
              <ProtectedRoute requiredRole={ROLES.ADMIN}>
                <SubjectsList />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.ATTENDANCE}
            element={<AttendanceMark />}
          />
          <Route
            path={ROUTES.ATTENDANCE_MARK}
            element={<AttendanceMark />}
          />
          <Route
            path={ROUTES.ATTENDANCE_REPORT}
            element={<AttendanceMark />}
          />

          <Route path={ROUTES.EXAMS} element={<ExamsList />} />
          <Route
            path={ROUTES.EXAM_ADD}
            element={
              <ProtectedRoute requiredRole={ROLES.ADMIN}>
                <ExamCreate />
              </ProtectedRoute>
            }
          />
          <Route path={ROUTES.RESULTS} element={<ExamsList />} />

          <Route
            path={ROUTES.FEES}
            element={
              <ProtectedRoute requiredRole={ROLES.ADMIN}>
                <FeesList />
              </ProtectedRoute>
            }
          />
          <Route path={ROUTES.FEE_STRUCTURE} element={<FeesList />} />
          <Route path={ROUTES.FEE_PAYMENT} element={<FeesList />} />

          <Route path={ROUTES.NOTICES} element={<NoticesList />} />
          <Route
            path={ROUTES.NOTICE_ADD}
            element={
              <ProtectedRoute requiredRole={ROLES.ADMIN}>
                <NoticeForm />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.NOTICE_EDIT}
            element={
              <ProtectedRoute requiredRole={ROLES.ADMIN}>
                <NoticeForm />
              </ProtectedRoute>
            }
          />
          <Route path={ROUTES.TIMETABLE} element={<TimetableList />} />
          <Route
            path={ROUTES.TIMETABLE_CREATE}
            element={
              <ProtectedRoute requiredRole={ROLES.ADMIN}>
                <TimetableCreate />
              </ProtectedRoute>
            }
          />

          <Route path={ROUTES.PROFILE} element={<Profile />} />
          <Route path={ROUTES.SUPPORT} element={<SupportPage />} />
        </Route>
        <Route path="/" element={<Navigate to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN} replace />} />
        <Route path="*" element={<Navigate to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
