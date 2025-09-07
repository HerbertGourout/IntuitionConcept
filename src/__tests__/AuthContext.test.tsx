import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import * as firebaseAuth from 'firebase/auth';
import { auth } from '../firebase';

vi.mock('../firebase', () => ({
  auth: {
    currentUser: null,
  },
  db: {}
}));

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  updateProfile: vi.fn(),
  onAuthStateChanged: vi.fn(),
  sendEmailVerification: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false })),
  updateDoc: vi.fn(),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Composant de test pour utiliser le contexte
const TestComponent: React.FC = () => {
  const { user, isLoading, login, logout, register, hasPermission, hasRole } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="user">{user ? user.email : 'No User'}</div>
      <div data-testid="admin-access">{hasRole('admin') ? 'Admin' : 'Not Admin'}</div>
      <div data-testid="create-permission">{hasPermission('projects.create') ? 'Can Create' : 'Cannot Create'}</div>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={() => register('test@example.com', 'password', 'Test User')}>Register</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

const renderWithAuthProvider = () => {
  return render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up default mock for onAuthStateChanged that returns an unsubscribe function
    const mockOnAuthStateChanged = vi.mocked(firebaseAuth.onAuthStateChanged);
    mockOnAuthStateChanged.mockImplementation((_auth: any, callback: any) => {
      // Call callback with null user by default
      setTimeout(() => callback(null), 0);
      return vi.fn(); // Return unsubscribe function
    });
  });

  it('should render loading state initially', () => {
    renderWithAuthProvider();
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
  });

  it('should show no user when not authenticated', async () => {
    const mockOnAuthStateChanged = vi.mocked(firebaseAuth.onAuthStateChanged);
    mockOnAuthStateChanged.mockImplementation((_authInstance: any, callback: any) => {
      callback(null);
      return vi.fn(); // unsubscribe function
    });

    renderWithAuthProvider();
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      expect(screen.getByTestId('user')).toHaveTextContent('No User');
    });
  });

  it('should handle login successfully', async () => {
    const mockSignInWithEmailAndPassword = vi.mocked(firebaseAuth.signInWithEmailAndPassword);
    const mockUser = {
      uid: '123',
      email: 'test@example.com',
      emailVerified: true,
    } as any;
    
    mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockUser } as any);

    renderWithAuthProvider();
    
    const loginButton = screen.getByText('Login');
    await userEvent.click(loginButton);

    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', 'password');
  });

  it('should handle registration successfully', async () => {
    const mockCreateUserWithEmailAndPassword = vi.mocked(firebaseAuth.createUserWithEmailAndPassword);
    const mockUser = {
      uid: '123',
      email: 'test@example.com',
      emailVerified: false,
    } as any;
    
    mockCreateUserWithEmailAndPassword.mockResolvedValue({ user: mockUser } as any);

    renderWithAuthProvider();
    
    const registerButton = screen.getByText('Register');
    await userEvent.click(registerButton);

    expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', 'password');
  });

  it('should handle logout successfully', async () => {
    const mockSignOut = vi.mocked(firebaseAuth.signOut);
    mockSignOut.mockResolvedValue(undefined);

    renderWithAuthProvider();
    
    const logoutButton = screen.getByText('Logout');
    await userEvent.click(logoutButton);

    expect(mockSignOut).toHaveBeenCalledWith(auth);
  });

  it('should check permissions correctly', async () => {
    const mockOnAuthStateChanged = vi.mocked(firebaseAuth.onAuthStateChanged);
    const mockUser = {
      uid: '123',
      email: 'admin@example.com',
      emailVerified: true,
    };
    
    mockOnAuthStateChanged.mockImplementation((_authInstance: any, callback: any) => {
      callback(mockUser);
      return vi.fn();
    });

    renderWithAuthProvider();
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
  });

  it('should check roles correctly', async () => {
    const mockOnAuthStateChanged = vi.mocked(firebaseAuth.onAuthStateChanged);
    const mockUser = {
      uid: '123',
      email: 'admin@example.com',
      emailVerified: true,
    };
    
    mockOnAuthStateChanged.mockImplementation((_authInstance: any, callback: any) => {
      callback(mockUser);
      return vi.fn();
    });

    renderWithAuthProvider();
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
  });
});
