import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth, useAdminAuth } from "./context/AuthContext";
import Navbar  from "./components/common/Navbar";
import Footer  from "./components/common/Footer";
import Spinner from "./components/common/Spinner";

// ── Lazy load every page ──────────────────────────────────────────
const Home              = lazy(() => import("./pages/Home"));
const Courses           = lazy(() => import("./pages/Courses"));
const CourseDetail      = lazy(() => import("./pages/CourseDetail"));
const VerifyCertificate = lazy(() => import("./pages/VerifyCertificate"));
const NotFound          = lazy(() => import("./pages/NotFound"));

const Login    = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));

const StudentDashboard = lazy(() => import("./pages/student/Dashboard"));
const MyCourses        = lazy(() => import("./pages/student/MyCourses"));
const LearnCourse      = lazy(() => import("./pages/student/LearnCourse"));
const MyCertificates   = lazy(() => import("./pages/student/MyCertificates"));
const Profile          = lazy(() => import("./pages/student/Profile"));
const PaymentHistory   = lazy(() => import("./pages/student/PaymentHistory"));

const AdminLogin        = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout       = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard    = lazy(() => import("./pages/admin/Dashboard"));
const AdminCourses      = lazy(() => import("./pages/admin/Courses"));
const AdminCourseForm   = lazy(() => import("./pages/admin/CourseForm"));
const AdminLessons      = lazy(() => import("./pages/admin/Lessons"));
const AdminUsers        = lazy(() => import("./pages/admin/Users"));
const AdminEnrollments  = lazy(() => import("./pages/admin/Enrollments"));
const AdminPayments     = lazy(() => import("./pages/admin/Payments"));
const AdminCertificates = lazy(() => import("./pages/admin/Certificates"));
const AdminQuizForm     = lazy(() => import("./pages/admin/QuizForm"));
const AdminReviews      = lazy(() => import("./pages/admin/Reviews"));
const AdminSettings     = lazy(() => import("./pages/admin/Settings"));

// ── Guards ────────────────────────────────────────────────────────
function StudentRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { isAuthenticated, loading } = useAdminAuth();
  if (loading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return children;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Spinner />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

function AdminPublicRoute({ children }) {
  const { isAuthenticated, loading } = useAdminAuth();
  if (loading) return <Spinner />;
  if (isAuthenticated) return <Navigate to="/admin" replace />;
  return children;
}

function StudentLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-64px)]">{children}</main>
      <Footer />
    </>
  );
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-surface-950">
      <div className="w-10 h-10 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin" />
    </div>
  );
}

// ── Routes ────────────────────────────────────────────────────────
export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<StudentLayout><Home /></StudentLayout>} />
        <Route path="/courses" element={<StudentLayout><Courses /></StudentLayout>} />
        <Route path="/courses/:slug" element={<StudentLayout><CourseDetail /></StudentLayout>} />
        <Route path="/verify/:certId" element={<StudentLayout><VerifyCertificate /></StudentLayout>} />

        {/* Auth */}
        <Route path="/login"    element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
        <Route path="/admin/login" element={<AdminPublicRoute><AdminLogin /></AdminPublicRoute>} />

        {/* Student */}
        <Route path="/dashboard" element={<StudentRoute><StudentLayout><StudentDashboard /></StudentLayout></StudentRoute>} />
        <Route path="/dashboard/my-courses" element={<StudentRoute><StudentLayout><MyCourses /></StudentLayout></StudentRoute>} />
        <Route path="/dashboard/certificates" element={<StudentRoute><StudentLayout><MyCertificates /></StudentLayout></StudentRoute>} />
        <Route path="/dashboard/payments" element={<StudentRoute><StudentLayout><PaymentHistory /></StudentLayout></StudentRoute>} />
        <Route path="/dashboard/profile" element={<StudentRoute><StudentLayout><Profile /></StudentLayout></StudentRoute>} />
        <Route path="/learn/:courseId" element={<StudentRoute><LearnCourse /></StudentRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="courses/new" element={<AdminCourseForm />} />
          <Route path="courses/:id/edit" element={<AdminCourseForm />} />
          <Route path="courses/:id/lessons" element={<AdminLessons />} />
          <Route path="courses/:id/lessons/:lessonId/quiz" element={<AdminQuizForm />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="enrollments" element={<AdminEnrollments />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="certificates" element={<AdminCertificates />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
