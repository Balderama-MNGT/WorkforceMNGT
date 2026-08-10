import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import MainLayout from '../layout/MainLayout';

export default function PrivateLayout({ children, adminOnly = false }) {
  const content = <MainLayout>{children}</MainLayout>;

  return (
    <ProtectedRoute>
      {adminOnly ? <AdminRoute>{content}</AdminRoute> : content}
    </ProtectedRoute>
  );
}
