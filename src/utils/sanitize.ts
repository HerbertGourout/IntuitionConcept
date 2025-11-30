/**
 * Utilitaire de sanitization pour la sécurité
 * Protection contre les attaques XSS
 */

import DOMPurify from 'dompurify';

/**
 * Configuration stricte de DOMPurify
 */
const PURIFY_CONFIG = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['href', 'title', 'target'],
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  SAFE_FOR_TEMPLATES: true,
};

/**
 * Nettoie le HTML pour prévenir les attaques XSS
 */
export const sanitizeHTML = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, PURIFY_CONFIG);
};

/**
 * Nettoie une chaîne pour l'utiliser dans une URL
 */
export const sanitizeURL = (url: string): string => {
  try {
    const parsed = new URL(url);
    // Autoriser uniquement http et https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
};

/**
 * Échappe les caractères spéciaux pour SQL/NoSQL
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Supprimer < et >
    .replace(/['"]/g, '') // Supprimer quotes
    .replace(/[;]/g, '') // Supprimer point-virgule
    .trim();
};

/**
 * Valide et nettoie un email
 */
export const sanitizeEmail = (email: string): string => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const cleaned = email.toLowerCase().trim();
  return emailRegex.test(cleaned) ? cleaned : '';
};

/**
 * Valide et nettoie un numéro de téléphone
 */
export const sanitizePhone = (phone: string): string => {
  // Garder uniquement les chiffres et le +
  return phone.replace(/[^\d+]/g, '');
};

/**
 * Nettoie un objet récursivement
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const cleaned: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      cleaned[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      cleaned[key] = sanitizeObject(value);
    } else {
      cleaned[key] = value;
    }
  }
  
  return cleaned as T;
};

/**
 * Valide un token JWT (format basique)
 */
export const isValidJWT = (token: string): boolean => {
  const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
  return jwtRegex.test(token);
};

/**
 * Nettoie les données de formulaire
 */
export const sanitizeFormData = (formData: FormData): FormData => {
  const cleaned = new FormData();
  
  formData.forEach((value, key) => {
    if (typeof value === 'string') {
      cleaned.append(key, sanitizeInput(value));
    } else {
      cleaned.append(key, value);
    }
  });
  
  return cleaned;
};
