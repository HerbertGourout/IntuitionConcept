// Service de validation croisée des données OCR
import { EnhancedOCRData } from './ai/ocrEnhancer';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
  confidence: number;
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'critical' | 'high' | 'medium';
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

class OCRValidationService {
  /**
   * Valide les données OCR extraites
   */
  validate(data: EnhancedOCRData): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: string[] = [];

    // 1. Validation montants
    const amountValidation = this.validateAmounts(data);
    errors.push(...amountValidation.errors);
    warnings.push(...amountValidation.warnings);

    // 2. Validation dates
    const dateValidation = this.validateDates(data);
    errors.push(...dateValidation.errors);
    warnings.push(...dateValidation.warnings);

    // 3. Validation cohérence HT/TTC/TVA
    const taxValidation = this.validateTaxCoherence(data);
    errors.push(...taxValidation.errors);
    warnings.push(...taxValidation.warnings);

    // 4. Validation fournisseur
    const vendorValidation = this.validateVendor(data);
    warnings.push(...vendorValidation.warnings);

    // 5. Validation articles
    const itemsValidation = this.validateItems(data);
    warnings.push(...itemsValidation.warnings);

    // 6. Génération suggestions
    suggestions.push(...this.generateSuggestions(data, errors, warnings));

    // 7. Calcul confiance globale
    const confidence = this.calculateValidationConfidence(data, errors, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      confidence
    };
  }

  /**
   * Validation des montants
   */
  private validateAmounts(data: EnhancedOCRData): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
  } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Vérifier présence montant
    if (!data.normalizedData.amount || data.normalizedData.amount <= 0) {
      errors.push({
        field: 'amount',
        message: 'Montant total manquant ou invalide',
        severity: 'critical'
      });
    }

    // Vérifier cohérence avec montants extraits
    if (data.amounts && data.amounts.length > 0) {
      const maxAmount = Math.max(...data.amounts);
      if (data.normalizedData.amount && Math.abs(data.normalizedData.amount - maxAmount) > maxAmount * 0.1) {
        warnings.push({
          field: 'amount',
          message: `Montant total (${data.normalizedData.amount}) diffère des montants détectés (max: ${maxAmount})`,
          suggestion: 'Vérifier le montant total sur le document'
        });
      }
    }

    // Vérifier montants aberrants
    if (data.normalizedData.amount) {
      if (data.normalizedData.amount < 100) {
        warnings.push({
          field: 'amount',
          message: 'Montant très faible (< 100 FCFA)',
          suggestion: 'Vérifier l\'unité monétaire'
        });
      }
      if (data.normalizedData.amount > 100000000) {
        warnings.push({
          field: 'amount',
          message: 'Montant très élevé (> 100M FCFA)',
          suggestion: 'Vérifier le montant sur le document original'
        });
      }
    }

    return { errors, warnings };
  }

  /**
   * Validation des dates
   */
  private validateDates(data: EnhancedOCRData): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
  } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Vérifier présence date
    if (!data.normalizedData.date) {
      warnings.push({
        field: 'date',
        message: 'Date de facture manquante',
        suggestion: 'Rechercher la date sur le document'
      });
      return { errors, warnings };
    }

    try {
      const date = new Date(data.normalizedData.date);
      const now = new Date();
      const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
      const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

      // Vérifier date dans le futur
      if (date > oneYearFromNow) {
        errors.push({
          field: 'date',
          message: `Date dans le futur lointain (${data.normalizedData.date})`,
          severity: 'high'
        });
      }

      // Vérifier date trop ancienne
      if (date < twoYearsAgo) {
        warnings.push({
          field: 'date',
          message: `Date ancienne (${data.normalizedData.date})`,
          suggestion: 'Vérifier s\'il s\'agit bien de la date de facture'
        });
      }

      // Vérifier date future proche (acceptable)
      if (date > now && date <= oneYearFromNow) {
        warnings.push({
          field: 'date',
          message: 'Date dans le futur proche',
          suggestion: 'Peut être une date d\'échéance'
        });
      }
    } catch {
      errors.push({
        field: 'date',
        message: `Format de date invalide (${data.normalizedData.date})`,
        severity: 'medium'
      });
    }

    return { errors, warnings };
  }

  /**
   * Validation cohérence HT/TTC/TVA
   */
  private validateTaxCoherence(data: EnhancedOCRData): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
  } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Vérifier si données structurées disponibles
    if (!data.items || data.items.length === 0) {
      return { errors, warnings };
    }

    // Calculer total des articles
    const itemsTotal = data.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

    // Comparer avec montant total
    if (data.normalizedData.amount && itemsTotal > 0) {
      const difference = Math.abs(data.normalizedData.amount - itemsTotal);
      const percentDiff = (difference / data.normalizedData.amount) * 100;

      if (percentDiff > 10) {
        warnings.push({
          field: 'items',
          message: `Total articles (${itemsTotal}) diffère du total facture (${data.normalizedData.amount}) de ${percentDiff.toFixed(1)}%`,
          suggestion: 'Vérifier les quantités et prix unitaires'
        });
      }
    }

    // Vérifier cohérence prix unitaires
    data.items.forEach((item, index) => {
      if (item.quantity && item.unitPrice && item.totalPrice) {
        const expectedTotal = item.quantity * item.unitPrice;
        const diff = Math.abs(expectedTotal - item.totalPrice);
        
        if (diff > 1) { // Tolérance 1 FCFA pour arrondis
          warnings.push({
            field: `item_${index}`,
            message: `Article "${item.description}": Total calculé (${expectedTotal}) ≠ Total indiqué (${item.totalPrice})`,
            suggestion: 'Vérifier les calculs'
          });
        }
      }
    });

    return { errors, warnings };
  }

  /**
   * Validation fournisseur
   */
  private validateVendor(data: EnhancedOCRData): {
    warnings: ValidationWarning[];
  } {
    const warnings: ValidationWarning[] = [];

    if (!data.normalizedData.vendorName) {
      warnings.push({
        field: 'vendor',
        message: 'Nom du fournisseur manquant',
        suggestion: 'Rechercher le nom en haut du document'
      });
    } else {
      // Vérifier longueur nom
      if (data.normalizedData.vendorName.length < 3) {
        warnings.push({
          field: 'vendor',
          message: 'Nom du fournisseur trop court',
          suggestion: 'Vérifier le nom complet'
        });
      }

      // Vérifier si fournisseur reconnu
      if (!data.mappedVendor) {
        warnings.push({
          field: 'vendor',
          message: 'Fournisseur non reconnu dans la base',
          suggestion: 'Vérifier l\'orthographe ou ajouter à la base'
        });
      }
    }

    return { warnings };
  }

  /**
   * Validation articles
   */
  private validateItems(data: EnhancedOCRData): {
    warnings: ValidationWarning[];
  } {
    const warnings: ValidationWarning[] = [];

    if (!data.items || data.items.length === 0) {
      warnings.push({
        field: 'items',
        message: 'Aucun article détecté',
        suggestion: 'Vérifier si le document contient un tableau d\'articles'
      });
      return { warnings };
    }

    // Vérifier articles incomplets
    data.items.forEach((item, index) => {
      if (!item.description || item.description.length < 3) {
        warnings.push({
          field: `item_${index}`,
          message: `Article ${index + 1}: Description manquante ou trop courte`,
          suggestion: 'Compléter la description'
        });
      }

      if (!item.quantity || item.quantity <= 0) {
        warnings.push({
          field: `item_${index}`,
          message: `Article "${item.description}": Quantité manquante ou invalide`,
          suggestion: 'Vérifier la quantité'
        });
      }

      if (!item.unitPrice || item.unitPrice <= 0) {
        warnings.push({
          field: `item_${index}`,
          message: `Article "${item.description}": Prix unitaire manquant ou invalide`,
          suggestion: 'Vérifier le prix unitaire'
        });
      }
    });

    return { warnings };
  }

  /**
   * Génération suggestions
   */
  private generateSuggestions(
    data: EnhancedOCRData,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): string[] {
    const suggestions: string[] = [];

    // Suggestions basées sur confiance
    if (data.confidence < 70) {
      suggestions.push(' Confiance OCR faible : Vérifier attentivement toutes les données');
    } else if (data.confidence < 85) {
      suggestions.push(' Confiance OCR moyenne : Vérifier les montants et dates');
    }

    // Suggestions basées sur erreurs
    if (errors.length > 0) {
      suggestions.push(`⚠️ ${errors.length} erreur(s) critique(s) détectée(s) - Correction requise`);
    }

    // Suggestions basées sur warnings
    if (warnings.length > 3) {
      suggestions.push(`⚠️ ${warnings.length} avertissements - Vérification recommandée`);
    }

    // Suggestions spécifiques
    if (!data.normalizedData.invoiceNumber) {
      suggestions.push('📄 Ajouter le numéro de facture pour faciliter le suivi');
    }

    if (data.items && data.items.length > 0) {
      const uncategorized = data.items.filter(item => !item.category);
      if (uncategorized.length > 0) {
        suggestions.push(`🏷️ ${uncategorized.length} article(s) non catégorisé(s)`);
      }
    }

    
    if (data.suggestions && data.suggestions.length > 0) {
      suggestions.push(...data.suggestions);
    }

    return suggestions;
  }

  /**
   * Calcul confiance validation
   */
  private calculateValidationConfidence(
    data: EnhancedOCRData,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): number {
    let confidence = data.confidence || 0;

    // Pénalités erreurs
    errors.forEach(error => {
      switch (error.severity) {
        case 'critical':
          confidence -= 20;
          break;
        case 'high':
          confidence -= 10;
          break;
        case 'medium':
          confidence -= 5;
          break;
      }
    });

    // Pénalités warnings
    confidence -= warnings.length * 2;

    // Bonus si fournisseur reconnu
    if (data.mappedVendor && data.mappedVendor.confidence > 0.8) {
      confidence += 5;
    }

    // Bonus si articles bien structurés
    if (data.items && data.items.length > 0) {
      const completeItems = data.items.filter(
        item => item.description && item.quantity && item.unitPrice && item.totalPrice
      );
      if (completeItems.length === data.items.length) {
        confidence += 5;
      }
    }

    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Validation rapide (pour UI)
   */
  quickValidate(data: EnhancedOCRData): 'valid' | 'warning' | 'error' {
    const result = this.validate(data);
    
    if (result.errors.length > 0) {
      return 'error';
    }
    
    if (result.warnings.length > 2 || result.confidence < 70) {
      return 'warning';
    }
    
    return 'valid';
  }
}

// Instance singleton
export const ocrValidation = new OCRValidationService();

export default OCRValidationService;
