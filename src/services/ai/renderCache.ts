/**
 * Système de cache pour les rendus 3D
 * Évite les recomputes en cachant les résultats par hash d'entrée
 */

import { ViewSpec, GeneratedView } from '../../types/architecturalAnalysis';
import { Render3DRequest } from './render3DService';

export interface CacheEntry {
  hash: string;
  viewSpec: ViewSpec;
  request: Render3DRequest;
  result: GeneratedView;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number; // en bytes
  hitRate: number; // 0-1
  oldestEntry: number; // timestamp
  newestEntry: number; // timestamp
}

class RenderCache {
  private cache: Map<string, CacheEntry> = new Map();
  private hits: number = 0;
  private misses: number = 0;
  private maxEntries: number = 100; // Limite du cache
  private maxAge: number = 7 * 24 * 60 * 60 * 1000; // 7 jours

  /**
   * Génère un hash unique pour une requête
   */
  generateHash(
    viewSpec: ViewSpec,
    request: Render3DRequest,
    planImageHash?: string
  ): string {
    const key = {
      // ViewSpec
      type: viewSpec.type,
      category: viewSpec.category,
      viewAngle: viewSpec.viewAngle,
      model: viewSpec.model,
      quality: viewSpec.quality,
      timeOfDay: viewSpec.timeOfDay,
      season: viewSpec.season,
      decorationStyle: viewSpec.decorationStyle,
      lightingMode: viewSpec.lightingMode,
      
      // Request
      style: request.style,
      materials: request.materials,
      
      // Plan image (hash simple)
      planImage: planImageHash || this.hashString(request.planImage.substring(0, 100))
    };

    return this.hashString(JSON.stringify(key));
  }

  /**
   * Hash simple d'une chaîne
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  /**
   * Récupère un résultat du cache
   */
  get(hash: string): GeneratedView | null {
    const entry = this.cache.get(hash);
    
    if (!entry) {
      this.misses++;
      return null;
    }

    // Vérifier l'âge
    const age = Date.now() - entry.timestamp;
    if (age > this.maxAge) {
      this.cache.delete(hash);
      this.misses++;
      return null;
    }

    // Mettre à jour les stats d'accès
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.hits++;

    return entry.result;
  }

  /**
   * Ajoute un résultat au cache
   */
  set(
    hash: string,
    viewSpec: ViewSpec,
    request: Render3DRequest,
    result: GeneratedView
  ): void {
    // Vérifier la limite du cache
    if (this.cache.size >= this.maxEntries) {
      this.evictOldest();
    }

    const entry: CacheEntry = {
      hash,
      viewSpec,
      request,
      result,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now()
    };

    this.cache.set(hash, entry);
  }

  /**
   * Éviction de l'entrée la plus ancienne (LRU)
   */
  private evictOldest(): void {
    let oldestHash: string | null = null;
    let oldestTime = Infinity;

    for (const [hash, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestHash = hash;
      }
    }

    if (oldestHash) {
      this.cache.delete(oldestHash);
    }
  }

  /**
   * Vérifie si un hash existe dans le cache
   */
  has(hash: string): boolean {
    const entry = this.cache.get(hash);
    if (!entry) return false;

    const age = Date.now() - entry.timestamp;
    return age <= this.maxAge;
  }

  /**
   * Nettoie les entrées expirées
   */
  cleanup(): number {
    let cleaned = 0;
    const now = Date.now();

    for (const [hash, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > this.maxAge) {
        this.cache.delete(hash);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Vide complètement le cache
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Récupère les statistiques du cache
   */
  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    
    const totalSize = entries.reduce((sum, entry) => {
      // Estimation grossière de la taille
      return sum + JSON.stringify(entry).length;
    }, 0);

    const timestamps = entries.map(e => e.timestamp);
    const oldestEntry = timestamps.length > 0 ? Math.min(...timestamps) : 0;
    const newestEntry = timestamps.length > 0 ? Math.max(...timestamps) : 0;

    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? this.hits / totalRequests : 0;

    return {
      totalEntries: this.cache.size,
      totalSize,
      hitRate,
      oldestEntry,
      newestEntry
    };
  }

  /**
   * Exporte le cache (pour persistance)
   */
  export(): string {
    const entries = Array.from(this.cache.entries());
    return JSON.stringify(entries);
  }

  /**
   * Importe le cache (depuis persistance)
   */
  import(data: string): void {
    try {
      const entries: [string, CacheEntry][] = JSON.parse(data);
      this.cache = new Map(entries);
    } catch (error) {
      console.error('Erreur import cache:', error);
    }
  }

  /**
   * Récupère les entrées les plus utilisées
   */
  getMostUsed(limit: number = 10): CacheEntry[] {
    return Array.from(this.cache.values())
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, limit);
  }

  /**
   * Récupère les entrées récentes
   */
  getRecent(limit: number = 10): CacheEntry[] {
    return Array.from(this.cache.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }
}

export const renderCache = new RenderCache();
export default renderCache;
