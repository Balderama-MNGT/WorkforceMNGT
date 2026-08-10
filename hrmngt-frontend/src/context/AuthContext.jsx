import { createContext, useContext, useState, useCallback } from 'react';

// Static demo accounts. In a real app these would be verified against a
// backend; here they simulate the two roles the app supports.
const STATIC_ACCOUNTS = [
  {
    email: 'admin@workforcepro.com',
    password: 'Admin@123',
    id: 'EMP010',
    firstName: 'John',
    lastName: 'Delgado',
    role: 'Administrator',
    roleLabel: 'HR Manager / Admin',
    avatarSeed: 'John',
  },
  {
    email: 'employee@workforcepro.com',
    password: 'Employee@123',
    id: 'EMP001',
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    role: 'Employee',
    roleLabel: 'Employee',
    avatarSeed: 'Juan',
  },
];

const STORAGE_KEY = 'workforce_auth_user';

const AuthContext = createContext(null);

function getInitialUser() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    // Re-validate against the known accounts so stale/tampered storage can't fake a session
    const match = STATIC_ACCOUNTS.find((a) => a.email === parsed.email);
    return match ? { ...match, password: undefined } : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser);
  const [authError, setAuthError] = useState(null);

  const login = useCallback((email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const match = STATIC_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === normalizedEmail && a.password === password
    );

    if (!match) {
      setAuthError('Invalid email or password. Please try again.');
      return { success: false };
    }

    const sessionUser = { ...match, password: undefined };
    setUser(sessionUser);
    setAuthError(null);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
    } catch {
      // ignore write errors (private browsing, etc.)
    }
    return { success: true, user: sessionUser };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore write errors
    }
  }, []);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'Administrator',
        isEmployee: user?.role === 'Employee',
        login,
        logout,
        authError,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
