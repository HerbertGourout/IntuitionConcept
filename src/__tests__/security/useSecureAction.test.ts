import { renderHook, act } from '@testing-library/react';
import { useSecureAction } from '../../hooks/useSecureAction';
import { useAuth } from '../../contexts/AuthContext';
import { auditLogger } from '../../services/auditLogger';
import { sessionManager } from '../../services/sessionManager';

// Mock des dépendances
jest.mock('../../contexts/AuthContext');
jest.mock('../../services/auditLogger');
jest.mock('../../services/sessionManager');
jest.mock('antd', () => ({
  message: {
    error: jest.fn(),
    warning: jest.fn()
  }
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockAuditLogger = auditLogger as jest.Mocked<typeof auditLogger>;
const mockSessionManager = sessionManager as jest.Mocked<typeof sessionManager>;

describe('useSecureAction', () => {
  const mockUser = {
    uid: 'test-user-id',
    role: 'manager' as const,
    email: 'test@example.com',
    permissions: ['quotes.edit', 'quotes.create'],
    createdAt: new Date().toISOString(),
    isActive: true
  };

  const mockAction = jest.fn().mockResolvedValue('success');

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAuth.mockReturnValue({
      user: mockUser,
      hasPermission: jest.fn((permission: string) => 
        mockUser.permissions.includes(permission)
      ),
      firebaseUser: null,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      updateUserProfile: jest.fn(),
      resetPassword: jest.fn(),
      verifyEmail: jest.fn(),
      loginWithGoogle: jest.fn(),
      mfaGenerateTotpSecret: jest.fn(),
      mfaEnrollTotp: jest.fn(),
      mfaGetEnrolledFactors: jest.fn(),
      mfaUnenroll: jest.fn(),
      hasRole: jest.fn(() => false),
      resendEmailVerification: jest.fn(),
      refreshClaims: jest.fn()
    } as unknown as ReturnType<typeof useAuth>);

    mockSessionManager.requiresRecentAuth.mockResolvedValue(false);
    mockAuditLogger.logResourceAccess.mockResolvedValue();
    mockAuditLogger.logSensitiveAction.mockResolvedValue();
  });

  describe('Vérification des permissions', () => {
    it('devrait autoriser l\'exécution avec les bonnes permissions', async () => {
      const { result } = renderHook(() =>
        useSecureAction(
          mockAction,
          'edit_quote',
          {
            requiredPermissions: ['quotes.edit'],
            resource: 'quote',
            resourceId: 'quote-123'
          }
        )
      );

      expect(result.current.canExecute).toBe(true);

      await act(async () => {
        const response = await result.current.execute('test-arg');
        expect(response).toBe('success');
      });

      expect(mockAction).toHaveBeenCalledWith('test-arg');
      expect(mockAuditLogger.logSensitiveAction).toHaveBeenCalledWith(
        mockUser.uid,
        mockUser.role,
        'edit_quote',
        'quote',
        'quote-123',
        { args: ['test-arg'] },
        true
      );
    });

    it('devrait refuser l\'exécution sans les permissions requises', async () => {
      const { result } = renderHook(() =>
        useSecureAction(
          mockAction,
          'delete_quote',
          {
            requiredPermissions: ['quotes.delete'], // Permission non accordée
            resource: 'quote',
            resourceId: 'quote-123'
          }
        )
      );

      expect(result.current.canExecute).toBe(false);

      await act(async () => {
        const response = await result.current.execute();
        expect(response).toBeNull();
      });

      expect(mockAction).not.toHaveBeenCalled();
      expect(mockAuditLogger.logResourceAccess).toHaveBeenCalledWith(
        mockUser.uid,
        mockUser.role,
        'quote',
        'quote-123',
        'delete_quote',
        false,
        expect.stringContaining('Permissions manquantes')
      );
    });
  });

  describe('Authentification récente', () => {
    it('devrait vérifier l\'authentification récente quand requise', async () => {
      mockSessionManager.requiresRecentAuth.mockResolvedValue(true);

      const { result } = renderHook(() =>
        useSecureAction(
          mockAction,
          'sensitive_action',
          {
            requiredPermissions: ['quotes.edit'],
            requireRecentAuth: true,
            maxAuthAge: 15 * 60 * 1000,
            resource: 'quote'
          }
        )
      );

      await act(async () => {
        const response = await result.current.execute();
        expect(response).toBeNull();
      });

      expect(mockSessionManager.requiresRecentAuth).toHaveBeenCalledWith(15 * 60 * 1000);
      expect(mockAction).not.toHaveBeenCalled();
      expect(mockAuditLogger.logResourceAccess).toHaveBeenCalledWith(
        mockUser.uid,
        mockUser.role,
        'quote',
        'unknown',
        'sensitive_action',
        false,
        'Authentification récente requise'
      );
    });

    it('devrait autoriser l\'action avec une authentification récente valide', async () => {
      mockSessionManager.requiresRecentAuth.mockResolvedValue(false);

      const { result } = renderHook(() =>
        useSecureAction(
          mockAction,
          'sensitive_action',
          {
            requiredPermissions: ['quotes.edit'],
            requireRecentAuth: true,
            resource: 'quote'
          }
        )
      );

      await act(async () => {
        const response = await result.current.execute();
        expect(response).toBe('success');
      });

      expect(mockAction).toHaveBeenCalled();
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait logger les erreurs et les re-lancer', async () => {
      const error = new Error('Action failed');
      mockAction.mockRejectedValue(error);

      const { result } = renderHook(() =>
        useSecureAction(
          mockAction,
          'failing_action',
          {
            requiredPermissions: ['quotes.edit'],
            resource: 'quote',
            resourceId: 'quote-123'
          }
        )
      );

      await act(async () => {
        await expect(result.current.execute()).rejects.toThrow('Action failed');
      });

      expect(mockAuditLogger.logSensitiveAction).toHaveBeenCalledWith(
        mockUser.uid,
        mockUser.role,
        'failing_action',
        'quote',
        'quote-123',
        { 
          error: 'Action failed',
          args: undefined 
        },
        false
      );
    });
  });

  describe('Utilisateur non connecté', () => {
    it('devrait refuser l\'accès sans utilisateur connecté', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        hasPermission: jest.fn(() => false),
        firebaseUser: null,
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
        updateUserProfile: jest.fn(),
        resetPassword: jest.fn(),
        verifyEmail: jest.fn(),
        loginWithGoogle: jest.fn(),
        mfaGenerateTotpSecret: jest.fn(),
        mfaEnrollTotp: jest.fn(),
        mfaGetEnrolledFactors: jest.fn(),
        mfaUnenroll: jest.fn(),
        hasRole: jest.fn(() => false),
        resendEmailVerification: jest.fn(),
        refreshClaims: jest.fn()
      } as unknown as ReturnType<typeof useAuth>);

      const { result } = renderHook(() =>
        useSecureAction(
          mockAction,
          'test_action',
          { requiredPermissions: ['quotes.edit'] }
        )
      );

      expect(result.current.canExecute).toBe(false);

      await act(async () => {
        const response = await result.current.execute();
        expect(response).toBeNull();
      });

      expect(mockAction).not.toHaveBeenCalled();
    });
  });
});
