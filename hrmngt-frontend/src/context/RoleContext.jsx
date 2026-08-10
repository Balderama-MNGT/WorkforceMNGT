import { createContext, useContext } from 'react';
import { roles as roleDefinitions } from '../mock-data/roles';
import { useAuth } from './AuthContext';

const RoleContext = createContext(null);

export function RoleProvider({ children }) {
  const { user } = useAuth();
  const currentRole = user?.role || 'Employee';

  const getRoleDetails = () => roleDefinitions.find(r => r.name === currentRole);
  const hasPermission = (permission) => {
    const role = getRoleDetails();
    return role?.permissions?.includes(permission) || false;
  };

  return (
    <RoleContext.Provider value={{ currentRole, getRoleDetails, hasPermission }}>
      {children}
    </RoleContext.Provider>
  );
}

export const useRole = () => {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
};
