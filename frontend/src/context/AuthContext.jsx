/**
 * AuthContext — Provides authentication state across the app.
 * Checks for an active session on mount and exposes user info & auth helpers.
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { getUser, logout as apiLogout } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Verify if the user has a valid session with the backend.
   */
  const checkAuth = async () => {
    try {
      const data = await getUser();
      if (data.authenticated) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log out — clear server session and reset local state.
   */
  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      // Even if the API call fails, clear local state
    }
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to consume auth context.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
