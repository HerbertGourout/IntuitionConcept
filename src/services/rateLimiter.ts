/**
 * Service de Rate Limiting pour prévenir les abus
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map();
  private readonly cleanupInterval: number = 60000; // 1 minute

  constructor() {
    // Nettoyage périodique des entrées expirées
    setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  /**
   * Vérifie si une requête est autorisée
   * @param key - Identifiant unique (userId, IP, etc.)
   * @param maxRequests - Nombre max de requêtes
   * @param windowMs - Fenêtre de temps en ms
   */
  public checkLimit(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.requests.get(key);

    if (!entry || now > entry.resetTime) {
      // Nouvelle fenêtre
      this.requests.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    if (entry.count >= maxRequests) {
      return false; // Limite atteinte
    }

    // Incrémenter le compteur
    entry.count++;
    return true;
  }

  /**
   * Obtient le temps restant avant reset (en secondes)
   */
  public getTimeUntilReset(key: string): number {
    const entry = this.requests.get(key);
    if (!entry) return 0;

    const now = Date.now();
    const remaining = Math.max(0, entry.resetTime - now);
    return Math.ceil(remaining / 1000);
  }

  /**
   * Réinitialise le compteur pour une clé
   */
  public reset(key: string): void {
    this.requests.delete(key);
  }

  /**
   * Nettoie les entrées expirées
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

// Instance singleton
export const rateLimiter = new RateLimiter();

/**
 * Configurations prédéfinies
 */
export const RATE_LIMITS = {
  // API générale: 100 requêtes par minute
  API: { maxRequests: 100, windowMs: 60000 },
  
  // Authentification: 5 tentatives par 15 minutes
  AUTH: { maxRequests: 5, windowMs: 900000 },
  
  // Upload de fichiers: 10 par heure
  UPLOAD: { maxRequests: 10, windowMs: 3600000 },
  
  // Génération IA: 20 par heure
  AI_GENERATION: { maxRequests: 20, windowMs: 3600000 },
  
  // OCR: 30 par heure
  OCR: { maxRequests: 30, windowMs: 3600000 },
  
  // Recherche: 60 par minute
  SEARCH: { maxRequests: 60, windowMs: 60000 },
};

/**
 * Middleware pour Express (si utilisé côté backend)
 */
export const rateLimitMiddleware = (
  limitType: keyof typeof RATE_LIMITS
) => {
  return (req: any, res: any, next: any) => {
    const key = req.user?.uid || req.ip || 'anonymous';
    const limit = RATE_LIMITS[limitType];

    if (!rateLimiter.checkLimit(key, limit.maxRequests, limit.windowMs)) {
      const retryAfter = rateLimiter.getTimeUntilReset(key);
      res.status(429).json({
        error: 'Too Many Requests',
        retryAfter,
        message: `Limite de ${limit.maxRequests} requêtes atteinte. Réessayez dans ${retryAfter}s.`
      });
      return;
    }

    next();
  };
};

/**
 * Hook React pour le rate limiting côté client
 */
export const useRateLimit = (key: string, limitType: keyof typeof RATE_LIMITS) => {
  const limit = RATE_LIMITS[limitType];

  const checkLimit = (): boolean => {
    return rateLimiter.checkLimit(key, limit.maxRequests, limit.windowMs);
  };

  const getTimeUntilReset = (): number => {
    return rateLimiter.getTimeUntilReset(key);
  };

  return { checkLimit, getTimeUntilReset };
};
