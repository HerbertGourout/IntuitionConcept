import { sessionManager } from '../../services/sessionManager';
import { auth } from '../../firebase';
import { getIdTokenResult } from 'firebase/auth';

// Mock Firebase Auth
jest.mock('../../firebase');
jest.mock('firebase/auth');

const mockAuth = auth as jest.Mocked<typeof auth>;
const mockGetIdTokenResult = getIdTokenResult as jest.MockedFunction<typeof getIdTokenResult>;

describe('SessionManager', () => {
  const mockUser = {
    uid: 'test-user-id',
    getIdToken: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    sessionManager.stopSessionMonitoring();
  });

  describe('getSessionInfo', () => {
    it('devrait retourner une session invalide sans utilisateur', async () => {
      mockAuth.currentUser = null;

      const sessionInfo = await sessionManager.getSessionInfo();

      expect(sessionInfo.isValid).toBe(false);
      expect(sessionInfo.timeUntilExpiry).toBe(0);
    });

    it('devrait retourner les informations de session valides', async () => {
      const futureTime = new Date(Date.now() + 60 * 60 * 1000); // 1 heure dans le futur
      mockAuth.currentUser = mockUser as any;
      mockGetIdTokenResult.mockResolvedValue({
        expirationTime: futureTime.toISOString(),
        authTime: new Date().toISOString(),
        claims: {}
      } as any);

      const sessionInfo = await sessionManager.getSessionInfo();

      expect(sessionInfo.isValid).toBe(true);
      expect(sessionInfo.timeUntilExpiry).toBeGreaterThan(0);
      expect(sessionInfo.shouldRefresh).toBe(false);
    });

    it('devrait indiquer qu\'un refresh est nécessaire proche de l\'expiration', async () => {
      const soonExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      mockAuth.currentUser = mockUser as any;
      mockGetIdTokenResult.mockResolvedValue({
        expirationTime: soonExpiry.toISOString(),
        authTime: new Date().toISOString(),
        claims: {}
      } as any);

      const sessionInfo = await sessionManager.getSessionInfo();

      expect(sessionInfo.isValid).toBe(true);
      expect(sessionInfo.shouldRefresh).toBe(true);
    });
  });

  describe('refreshSession', () => {
    it('devrait rafraîchir le token avec succès', async () => {
      mockAuth.currentUser = mockUser as any;
      mockUser.getIdToken.mockResolvedValue('new-token');

      const result = await sessionManager.refreshSession();

      expect(result).toBe(true);
      expect(mockUser.getIdToken).toHaveBeenCalledWith(true);
    });

    it('devrait retourner false sans utilisateur', async () => {
      mockAuth.currentUser = null;

      const result = await sessionManager.refreshSession();

      expect(result).toBe(false);
    });

    it('devrait gérer les erreurs de refresh', async () => {
      mockAuth.currentUser = mockUser as any;
      mockUser.getIdToken.mockRejectedValue(new Error('Refresh failed'));

      const result = await sessionManager.refreshSession();

      expect(result).toBe(false);
    });
  });

  describe('requiresRecentAuth', () => {
    it('devrait retourner true sans utilisateur', async () => {
      mockAuth.currentUser = null;

      const result = await sessionManager.requiresRecentAuth();

      expect(result).toBe(true);
    });

    it('devrait retourner false pour une auth récente', async () => {
      const recentAuthTime = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
      mockAuth.currentUser = mockUser as any;
      mockGetIdTokenResult.mockResolvedValue({
        authTime: recentAuthTime.toISOString(),
        expirationTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        claims: {}
      } as any);

      const result = await sessionManager.requiresRecentAuth(30 * 60 * 1000); // 30 minutes

      expect(result).toBe(false);
    });

    it('devrait retourner true pour une auth ancienne', async () => {
      const oldAuthTime = new Date(Date.now() - 60 * 60 * 1000); // 1 heure ago
      mockAuth.currentUser = mockUser as any;
      mockGetIdTokenResult.mockResolvedValue({
        authTime: oldAuthTime.toISOString(),
        expirationTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        claims: {}
      } as any);

      const result = await sessionManager.requiresRecentAuth(30 * 60 * 1000); // 30 minutes

      expect(result).toBe(true);
    });
  });

  describe('startSessionMonitoring', () => {
    it('devrait démarrer la surveillance et appeler les callbacks', async () => {
      const onWarning = jest.fn();
      const onExpiry = jest.fn();
      
      // Mock une session qui va expirer bientôt
      const soonExpiry = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes
      mockAuth.currentUser = mockUser as any;
      mockGetIdTokenResult.mockResolvedValue({
        expirationTime: soonExpiry.toISOString(),
        authTime: new Date().toISOString(),
        claims: {}
      } as any);

      sessionManager.startSessionMonitoring(onWarning, onExpiry);

      // Avancer le temps pour déclencher la vérification
      await jest.advanceTimersByTimeAsync(1000);

      expect(onWarning).toHaveBeenCalled();
      expect(onExpiry).not.toHaveBeenCalled();
    });

    it('devrait appeler onExpiry pour une session expirée', async () => {
      const onWarning = jest.fn();
      const onExpiry = jest.fn();
      
      // Mock une session expirée
      mockAuth.currentUser = mockUser as any;
      mockGetIdTokenResult.mockResolvedValue({
        expirationTime: new Date(Date.now() - 1000).toISOString(), // Expirée
        authTime: new Date().toISOString(),
        claims: {}
      } as any);

      sessionManager.startSessionMonitoring(onWarning, onExpiry);

      // Avancer le temps pour déclencher la vérification
      await jest.advanceTimersByTimeAsync(1000);

      expect(onExpiry).toHaveBeenCalled();
    });
  });
});
