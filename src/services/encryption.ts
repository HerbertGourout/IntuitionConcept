/**
 * Service d'encryption/decryption AES-256
 * Pour les données sensibles
 */

import CryptoJS from 'crypto-js';

class EncryptionService {
  private readonly algorithm = 'AES';
  private secretKey: string;

  constructor() {
    // Clé depuis les variables d'environnement
    this.secretKey = import.meta.env.VITE_ENCRYPTION_KEY || this.generateKey();
    
    if (!import.meta.env.VITE_ENCRYPTION_KEY) {
      console.warn('⚠️ VITE_ENCRYPTION_KEY non définie. Utilisation d\'une clé temporaire.');
    }
  }

  /**
   * Génère une clé aléatoire (fallback uniquement)
   */
  private generateKey(): string {
    return CryptoJS.lib.WordArray.random(256/8).toString();
  }

  /**
   * Encrypte une chaîne de caractères
   */
  public encrypt(plainText: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(plainText, this.secretKey);
      return encrypted.toString();
    } catch (error) {
      console.error('Erreur encryption:', error);
      throw new Error('Échec de l\'encryption');
    }
  }

  /**
   * Décrypte une chaîne encryptée
   */
  public decrypt(cipherText: string): string {
    try {
      const decrypted = CryptoJS.AES.decrypt(cipherText, this.secretKey);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Erreur decryption:', error);
      throw new Error('Échec de la décryption');
    }
  }

  /**
   * Encrypte un objet JSON
   */
  public encryptObject<T>(obj: T): string {
    const jsonString = JSON.stringify(obj);
    return this.encrypt(jsonString);
  }

  /**
   * Décrypte vers un objet JSON
   */
  public decryptObject<T>(cipherText: string): T {
    const jsonString = this.decrypt(cipherText);
    return JSON.parse(jsonString) as T;
  }

  /**
   * Hash une chaîne (one-way, pour mots de passe)
   */
  public hash(text: string): string {
    return CryptoJS.SHA256(text).toString();
  }

  /**
   * Hash avec salt (plus sécurisé)
   */
  public hashWithSalt(text: string, salt?: string): { hash: string; salt: string } {
    const usedSalt = salt || CryptoJS.lib.WordArray.random(128/8).toString();
    const hash = CryptoJS.SHA256(text + usedSalt).toString();
    return { hash, salt: usedSalt };
  }

  /**
   * Vérifie un hash
   */
  public verifyHash(text: string, hash: string, salt: string): boolean {
    const computed = CryptoJS.SHA256(text + salt).toString();
    return computed === hash;
  }

  /**
   * Génère un token sécurisé
   */
  public generateToken(length: number = 32): string {
    return CryptoJS.lib.WordArray.random(length).toString();
  }

  /**
   * Encrypte des données sensibles pour le stockage local
   */
  public encryptForStorage(key: string, data: any): void {
    const encrypted = this.encryptObject(data);
    localStorage.setItem(key, encrypted);
  }

  /**
   * Décrypte des données du stockage local
   */
  public decryptFromStorage<T>(key: string): T | null {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;

    try {
      return this.decryptObject<T>(encrypted);
    } catch {
      return null;
    }
  }

  /**
   * Supprime des données encryptées du stockage
   */
  public removeFromStorage(key: string): void {
    localStorage.removeItem(key);
  }
}

// Instance singleton
export const encryptionService = new EncryptionService();

/**
 * Utilitaires d'encryption rapides
 */
export const encrypt = (text: string) => encryptionService.encrypt(text);
export const decrypt = (text: string) => encryptionService.decrypt(text);
export const hash = (text: string) => encryptionService.hash(text);
export const generateToken = (length?: number) => encryptionService.generateToken(length);
