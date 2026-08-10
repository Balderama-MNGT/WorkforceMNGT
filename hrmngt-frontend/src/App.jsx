import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RoleProvider } from './context/RoleContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import PrivateLayout from './components/auth/PrivateLayout';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/dashboard/Dashboard';
import EmployeeDashboard from './pages/dashboard/EmployeeDashboard';
import Employees from './pages/employees/Employees';
import EmployeeRegistration from './pages/employees/EmployeeRegistration';
import Attendance from './pages/attendance/Attendance';
import Shifts from './pages/shifts/Shifts';
import Timesheets from './pages/timesheets/Timesheets';
import Leave from './pages/leave/Leave';
import Analytics from './pages/analytics/Analytics';
import Reports from './pages/reports/Reports';
import Settings from './pages/settings/Settings';
import MyAttendance from './pages/attendance/MyAttendance';
import MySchedule from './pages/shifts/MySchedule';
import MyTimesheet from './pages/timesheets/MyTimesheet';

// Renders the right dashboard for whoever is logged in, without needing a
// separate route for each role.
function HomeRoute() {
  const { isAdmin } = useAuth();
  return isAdmin ? <Dashboard /> : <EmployeeDashboard />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/" replace /> : <ForgotPassword />} />

      <Route path="/" element={<PrivateLayout><HomeRoute /></PrivateLayout>} />
      <Route path="/employees" element={<PrivateLayout adminOnly><Employees /></PrivateLayout>} />
      <Route path="/employee-registration" element={<PrivateLayout adminOnly><EmployeeRegistration /></PrivateLayout>} />
      <Route path="/attendance" element={<PrivateLayout adminOnly><Attendance /></PrivateLayout>} />
      <Route path="/shifts" element={<PrivateLayout adminOnly><Shifts /></PrivateLayout>} />
      <Route path="/timesheets" element={<PrivateLayout adminOnly><Timesheets /></PrivateLayout>} />
      <Route path="/my-timesheet" element={<PrivateLayout><MyTimesheet /></PrivateLayout>} />
      <Route path="/leave" element={<PrivateLayout><Leave /></PrivateLayout>} />
      <Route path="/my-attendance" element={<PrivateLayout><MyAttendance /></PrivateLayout>} />
      <Route path="/my-schedule" element={<PrivateLayout><MySchedule /></PrivateLayout>} />
      <Route path="/analytics" element={<PrivateLayout adminOnly><Analytics /></PrivateLayout>} />
      <Route path="/reports" element={<PrivateLayout adminOnly><Reports /></PrivateLayout>} />
      <Route path="/settings" element={<PrivateLayout><Settings /></PrivateLayout>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <ToastProvider>
              <NotificationProvider>
                <RoleProvider>
                  <AppRoutes />
                </RoleProvider>
              </NotificationProvider>
            </ToastProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </LanguageProvider>
  );
}
