import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simuler un utilisateur connecté pour les tests
  useEffect(() => {
    // En production, vous intégreriez Firebase Auth ici
    const mockUser: User = {
      uid: 'test-user-123',
      email: 'test@example.com',
      displayName: 'Utilisateur Test',
      phoneNumber: '+221701234567'
    };
    
    setUser(mockUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Simuler une connexion
      const mockUser: User = {
        uid: 'user-' + Date.now(),
        email,
        displayName: email.split('@')[0],
        phoneNumber: '+221701234567'
      };
      setUser(mockUser);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setUser(null);
  };

  const register = async (email: string, password: string, displayName?: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Simuler une inscription
      const mockUser: User = {
        uid: 'user-' + Date.now(),
        email,
        displayName: displayName || email.split('@')[0],
        phoneNumber: ''
      };
      setUser(mockUser);
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
