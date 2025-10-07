import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import LoginForm from '../../components/Auth/LoginForm';
import { vi } from 'vitest';

// Mock Firebase Auth
const mockSignInWithEmailAndPassword = vi.fn();
const mockCreateUserWithEmailAndPassword = vi.fn();
const mockSignOut = vi.fn();
const mockOnAuthStateChanged = vi.fn();

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: null
  })),
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  signOut: mockSignOut,
  onAuthStateChanged: mockOnAuthStateChanged,
  setPersistence: vi.fn(),
  browserLocalPersistence: {},
  browserSessionPersistence: {},
  inMemoryPersistence: {}
}));

vi.mock('../../firebase', () => ({
  auth: {
    currentUser: null
  },
  db: {}
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe('Authentication Flow E2E Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should login with valid credentials', async () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User'
    };

    mockSignInWithEmailAndPassword.mockResolvedValueOnce({
      user: mockUser
    });

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    // Fill login form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const loginButton = screen.getByRole('button', { name: /se connecter/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    // Verify login was called
    await waitFor(() => {
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      );
    });
  });

  test('should show error for invalid credentials', async () => {
    mockSignInWithEmailAndPassword.mockRejectedValueOnce(
      new Error('auth/invalid-credential')
    );

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const loginButton = screen.getByRole('button', { name: /se connecter/i });

    fireEvent.change(emailInput, { target: { value: 'invalid@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/identifiants invalides/i)).toBeInTheDocument();
    });
  });

  test('should validate email format', async () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const loginButton = screen.getByRole('button', { name: /se connecter/i });

    // Enter invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(loginButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/format d'email invalide/i)).toBeInTheDocument();
    });

    // Login should not be called
    expect(mockSignInWithEmailAndPassword).not.toHaveBeenCalled();
  });

  test('should require password', async () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const loginButton = screen.getByRole('button', { name: /se connecter/i });

    // Enter email but no password
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(loginButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/mot de passe requis/i)).toBeInTheDocument();
    });

    expect(mockSignInWithEmailAndPassword).not.toHaveBeenCalled();
  });

  test('should handle network errors gracefully', async () => {
    mockSignInWithEmailAndPassword.mockRejectedValueOnce(
      new Error('auth/network-request-failed')
    );

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const loginButton = screen.getByRole('button', { name: /se connecter/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    // Should show network error message
    await waitFor(() => {
      expect(screen.getByText(/problème de connexion/i)).toBeInTheDocument();
    });
  });

  test('should show loading state during authentication', async () => {
    // Mock a delayed response
    mockSignInWithEmailAndPassword.mockImplementationOnce(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const loginButton = screen.getByRole('button', { name: /se connecter/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    // Should show loading state
    expect(screen.getByText(/connexion en cours/i)).toBeInTheDocument();
    expect(loginButton).toBeDisabled();

    // Wait for completion
    await waitFor(() => {
      expect(screen.queryByText(/connexion en cours/i)).not.toBeInTheDocument();
    });
  });
});
