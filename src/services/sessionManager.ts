import { auth } from '../firebase';
import { getIdTokenResult } from 'firebase/auth';

export interface SessionInfo {
  isValid: boolean;
  expiresAt: Date;
  timeUntilExpiry: number;
  shouldRefresh: boolean;
}

class SessionManager {
  private refreshTimer: NodeJS.Timeout | null = null;
  private readonly WARNING_THRESHOLD = 5 * 60 * 1000; // 5 minutes avant expiration
  private readonly REFRESH_THRESHOLD = 10 * 60 * 1000; // 10 minutes avant expiration

  /**
   * Vérifie l'état de la session actuelle
   */
  async getSessionInfo(): Promise<SessionInfo> {
    const user = auth.currentUser;
    if (!user) {
      return {
        isValid: false,
        expiresAt: new Date(),
        timeUntilExpiry: 0,
        shouldRefresh: false
      };
    }

    try {
      const tokenResult = await getIdTokenResult(user);
      const expirationTime = new Date(tokenResult.expirationTime);
      const now = new Date();
      const timeUntilExpiry = expirationTime.getTime() - now.getTime();

      return {
        isValid: timeUntilExpiry > 0,
        expiresAt: expirationTime,
        timeUntilExpiry,
        shouldRefresh: timeUntilExpiry < this.REFRESH_THRESHOLD
      };
    } catch (error) {
      console.error('Erreur lors de la vérification de session:', error);
      return {
        isValid: false,
        expiresAt: new Date(),
        timeUntilExpiry: 0,
        shouldRefresh: true
      };
    }
  }

  /**
   * Démarre la surveillance automatique de la session
   */
  startSessionMonitoring(
    onWarning?: (timeLeft: number) => void,
    onExpiry?: () => void
  ): void {
    this.stopSessionMonitoring();

    const checkSession = async () => {
      const sessionInfo = await this.getSessionInfo();
      
      if (!sessionInfo.isValid) {
        onExpiry?.();
        return;
      }

      // Avertissement avant expiration
      if (sessionInfo.timeUntilExpiry <= this.WARNING_THRESHOLD) {
        onWarning?.(sessionInfo.timeUntilExpiry);
      }

      // Refresh automatique si nécessaire
      if (sessionInfo.shouldRefresh) {
        await this.refreshSession();
      }
    };

    // Vérification initiale
    checkSession();

    // Vérification périodique toutes les minutes
    this.refreshTimer = setInterval(checkSession, 60 * 1000);
  }

  /**
   * Arrête la surveillance de la session
   */
  stopSessionMonitoring(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Force le rafraîchissement du token
   */
  async refreshSession(): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) return false;

    try {
      await user.getIdToken(true); // Force refresh
      console.info('[SessionManager] Token rafraîchi avec succès');
      return true;
    } catch (error) {
      console.error('[SessionManager] Erreur lors du refresh:', error);
      return false;
    }
  }

  /**
   * Vérifie si une action nécessite une re-authentification récente
   */
  async requiresRecentAuth(maxAge: number = 30 * 60 * 1000): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) return true;

    try {
      const tokenResult = await getIdTokenResult(user);
      const authTime = new Date(tokenResult.authTime).getTime();
      const now = Date.now();
      
      return (now - authTime) > maxAge;
    } catch {
      return true;
    }
  }

  /**
   * Nettoie les ressources
   */
  cleanup(): void {
    this.stopSessionMonitoring();
  }
}

export const sessionManager = new SessionManager();
export default sessionManager;
