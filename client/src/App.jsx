import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth }      from "./context/AuthContext"; // student
import { useAdminAuth } from "./context/AuthContext"; // admin

import Navbar   from "./components/common/Navbar";
import Footer   from "./components/common/Footer";
import Spinner  from "./components/common/Spinner";

// Public
import Home              from "./pages/Home";
import Courses           from "./pages/Courses";
import CourseDetail      from "./pages/CourseDetail";
import VerifyCertificate from "./pages/VerifyCertificate";
import NotFound          from "./pages/NotFound";

// Auth
import Login    from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Student
import StudentDashboard from "./pages/student/Dashboard";
import MyCourses        from "./pages/student/MyCourses";
import LearnCourse      from "./pages/student/LearnCourse";
import MyCertificates   from "./pages/student/MyCertificates";
import Profile          from "./pages/student/Profile";
import PaymentHistory   from "./pages/student/PaymentHistory";

// Admin
import AdminLogin        from "./pages/admin/AdminLogin";
import AdminLayout       from "./pages/admin/AdminLayout";
import AdminDashboard    from "./pages/admin/Dashboard";
import AdminCourses      from "./pages/admin/Courses";
import AdminCourseForm   from "./pages/admin/CourseForm";
import AdminLessons      from "./pages/admin/Lessons";
import AdminUsers        from "./pages/admin/Users";
import AdminEnrollments  from "./pages/admin/Enrollments";
import AdminPayments     from "./pages/admin/Payments";
import AdminCertificates from "./pages/admin/Certificates";
import AdminQuizForm     from "./pages/admin/QuizForm";
import AdminReviews      from "./pages/admin/Reviews";

// ── Student Route Guard ────────────────────────────────────────────
const StudentRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth(); // uses STUDENT context only
  if (loading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// ── Admin Route Guard ──────────────────────────────────────────────
const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth(); // uses ADMIN context only
  if (loading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return children;
};

// ── Public Only (redirect if already logged in) ────────────────────
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Spinner />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

const AdminPublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();
  if (loading) return <Spinner />;
  if (isAuthenticated) return <Navigate to="/admin" replace />;
  return children;
};

// ── Layout ─────────────────────────────────────────────────────────
const StudentLayout = ({ children }) => (
  <>
    <Navbar />
    <main className="min-h-[calc(100vh-64px)]">{children}</main>
    <Footer />
  </>
);

// ── Routes ─────────────────────────────────────────────────────────
export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"              element={<StudentLayout><Home /></StudentLayout>} />
      <Route path="/courses"       element={<StudentLayout><Courses /></StudentLayout>} />
      <Route path="/courses/:slug" element={<StudentLayout><CourseDetail /></StudentLayout>} />
      <Route path="/verify/:certId" element={<StudentLayout><VerifyCertificate /></StudentLayout>} />

      {/* Auth */}
      <Route path="/login"    element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
      <Route path="/admin/login" element={<AdminPublicRoute><AdminLogin /></AdminPublicRoute>} />

      {/* Student (uses StudentAuthContext) */}
      <Route path="/dashboard"              element={<StudentRoute><StudentLayout><StudentDashboard /></StudentLayout></StudentRoute>} />
      <Route path="/dashboard/my-courses"   element={<StudentRoute><StudentLayout><MyCourses /></StudentLayout></StudentRoute>} />
      <Route path="/dashboard/certificates" element={<StudentRoute><StudentLayout><MyCertificates /></StudentLayout></StudentRoute>} />
      <Route path="/dashboard/payments"     element={<StudentRoute><StudentLayout><PaymentHistory /></StudentLayout></StudentRoute>} />
      <Route path="/dashboard/profile"      element={<StudentRoute><StudentLayout><Profile /></StudentLayout></StudentRoute>} />
      <Route path="/learn/:courseId"        element={<StudentRoute><LearnCourse /></StudentRoute>} />

      {/* Admin (uses AdminAuthContext - completely separate) */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index                              element={<AdminDashboard />} />
        <Route path="courses"                     element={<AdminCourses />} />
        <Route path="courses/new"                 element={<AdminCourseForm />} />
        <Route path="courses/:id/edit"            element={<AdminCourseForm />} />
        <Route path="courses/:id/lessons"         element={<AdminLessons />} />
        <Route path="courses/:id/lessons/:lessonId/quiz" element={<AdminQuizForm />} />
        <Route path="users"                       element={<AdminUsers />} />
        <Route path="enrollments"                 element={<AdminEnrollments />} />
        <Route path="payments"                    element={<AdminPayments />} />
        <Route path="certificates"                element={<AdminCertificates />} />
        <Route path="reviews"                     element={<AdminReviews />} />
        <Route path="settings"                    element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
