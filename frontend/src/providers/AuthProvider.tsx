import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User, Profile, AuthResponse } from '../features/auth/services';
import { apiService } from '../shared/services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  profile: Profile | null;
  profileCompletionRequired: boolean;
  loading: boolean;
  tempAuthData: { email?: string; phone?: string; name?: string; purpose?: string } | null;
  login: (authData: AuthResponse) => void;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  setTempAuthData: (data: { email?: string; phone?: string; name?: string; purpose?: string }) => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileCompletionRequired, setProfileCompletionRequired] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [tempAuthData, setTempAuthData] = useState<{ email?: string; phone?: string; name?: string; purpose?: string } | null>(null);

  useEffect(() => {
    const init = async () => {
      const token = apiService.getToken();
      if (token) {
        try {
          await fetchCurrentUser();
        } catch (error) {
          apiService.setToken(null);
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const fetchCurrentUser = async () => {
    const data = await authApi.me();
    if (!data?.user) {
      throw new Error('Invalid user data from /me endpoint');
    }
    setUser(data.user);
    setProfile(data.profile);
    setProfileCompletionRequired(data.profile_completion_required);
    setIsAuthenticated(true);
  };

  const login = (authData: AuthResponse) => {
    if (!authData?.accessToken) {
      throw new Error('Auth data missing access token');
    }
    apiService.setToken(authData.accessToken);
    setUser(authData.user);
    setProfile(authData.profile);
    setProfileCompletionRequired(authData.profile_completion_required);
    setIsAuthenticated(true);
    setTempAuthData(null);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      apiService.setToken(null);
      setUser(null);
      setProfile(null);
      setProfileCompletionRequired(false);
      setIsAuthenticated(false);
      setTempAuthData(null);
    }
  };

  const updateUser = (newUser: User) => {
    setUser(newUser);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        profile,
        profileCompletionRequired,
        loading,
        tempAuthData,
        login,
        logout,
        fetchCurrentUser,
        setTempAuthData,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
