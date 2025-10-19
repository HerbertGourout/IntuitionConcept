// Service de traitement OCR par lot (batch processing)
import { unifiedOcrService, UnifiedOCRResult } from './unifiedOcrService';
import { imagePreprocessor } from './imagePreprocessor';
import { ocrValidation, ValidationResult } from './ocrValidation';

export interface BatchOCROptions {
  maxConcurrent?: number;
  preprocessImages?: boolean;
  validateResults?: boolean;
  onProgress?: (progress: BatchProgress) => void;
  onFileComplete?: (result: BatchFileResult) => void;
}

export interface BatchProgress {
  total: number;
  completed: number;
  failed: number;
  percentage: number;
  currentFile?: string;
}

export interface BatchFileResult {
  file: File;
  success: boolean;
  ocrResult?: UnifiedOCRResult;
  validation?: ValidationResult;
  error?: string;
  processingTime: number;
}

export interface BatchOCRResult {
  results: BatchFileResult[];
  summary: {
    total: number;
    successful: number;
    failed: number;
    totalTime: number;
    averageTime: number;
    totalCost: number;
  };
}

class BatchOCRService {
  /**
   * Traite plusieurs fichiers en batch
   */
  async processBatch(
    files: File[],
    options: BatchOCROptions = {}
  ): Promise<BatchOCRResult> {
    const {
      maxConcurrent = 3,
      preprocessImages = true,
      validateResults = true,
      onProgress,
      onFileComplete
    } = options;

    const startTime = Date.now();
    const results: BatchFileResult[] = [];
    let completed = 0;
    let failed = 0;

    console.log(`🚀 Démarrage batch OCR: ${files.length} fichiers`);

    // Fonction de traitement d'un fichier
    const processFile = async (file: File): Promise<BatchFileResult> => {
      const fileStartTime = Date.now();

      try {
        // Prétraitement si activé
        let fileToProcess = file;
        if (preprocessImages) {
          try {
            const preprocessed = await imagePreprocessor.preprocessForOCR(file);
            fileToProcess = preprocessed.processedImage;
            console.log(`✅ Prétraitement: ${file.name}`);
          } catch (error) {
            console.warn(`⚠️ Prétraitement échoué pour ${file.name}, utilisation fichier original`);
          }
        }

        // OCR
        const ocrResult = await unifiedOcrService.processImage(fileToProcess);

        // Validation si activée
        let validation: ValidationResult | undefined;
        if (validateResults && ocrResult.extractedData) {
          const enhancedData = ocrResult.extractedData as unknown as Parameters<typeof ocrValidation.validate>[0];
          validation = ocrValidation.validate(enhancedData);
        }

        const processingTime = Date.now() - fileStartTime;

        return {
          file,
          success: true,
          ocrResult,
          validation,
          processingTime
        };

      } catch (error) {
        const processingTime = Date.now() - fileStartTime;
        console.error(`❌ Erreur traitement ${file.name}:`, error);

        return {
          file,
          success: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          processingTime
        };
      }
    };

    // Traitement par lots avec concurrence limitée
    const chunks = this.chunkArray(files, maxConcurrent);

    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map(async (file) => {
          const result = await processFile(file);

          // Mise à jour compteurs
          if (result.success) {
            completed++;
          } else {
            failed++;
          }

          // Callback progression
          if (onProgress) {
            onProgress({
              total: files.length,
              completed,
              failed,
              percentage: Math.round((completed + failed) / files.length * 100),
              currentFile: file.name
            });
          }

          // Callback fichier terminé
          if (onFileComplete) {
            onFileComplete(result);
          }

          return result;
        })
      );

      results.push(...chunkResults);
    }

    const totalTime = Date.now() - startTime;

    // Calcul statistiques
    const successful = results.filter(r => r.success).length;
    const totalCost = results
      .filter(r => r.success && r.ocrResult)
      .reduce((sum, r) => sum + (r.ocrResult?.cost || 0), 0);
    const averageTime = results.length > 0
      ? results.reduce((sum, r) => sum + r.processingTime, 0) / results.length
      : 0;

    console.log(`✅ Batch terminé: ${successful}/${files.length} réussis en ${totalTime}ms`);

    return {
      results,
      summary: {
        total: files.length,
        successful,
        failed: results.length - successful,
        totalTime,
        averageTime,
        totalCost
      }
    };
  }

  /**
   * Traite plusieurs fichiers avec retry automatique
   */
  async processBatchWithRetry(
    files: File[],
    options: BatchOCROptions & { maxRetries?: number } = {}
  ): Promise<BatchOCRResult> {
    const { maxRetries = 2, ...batchOptions } = options;

    let result = await this.processBatch(files, batchOptions);

    // Retry pour les fichiers échoués
    for (let retry = 0; retry < maxRetries; retry++) {
      const failedFiles = result.results
        .filter(r => !r.success)
        .map(r => r.file);

      if (failedFiles.length === 0) break;

      console.log(`🔄 Retry ${retry + 1}/${maxRetries}: ${failedFiles.length} fichiers`);

      const retryResult = await this.processBatch(failedFiles, batchOptions);

      // Remplacer les résultats échoués par les nouveaux
      result.results = result.results.map(r => {
        if (!r.success) {
          const newResult = retryResult.results.find(nr => nr.file === r.file);
          return newResult || r;
        }
        return r;
      });

      // Mettre à jour le résumé
      const successful = result.results.filter(r => r.success).length;
      result.summary.successful = successful;
      result.summary.failed = result.results.length - successful;
    }

    return result;
  }

  /**
   * Exporte les résultats batch en CSV
   */
  exportToCSV(result: BatchOCRResult): string {
    const headers = [
      'Fichier',
      'Statut',
      'Provider',
      'Confiance (%)',
      'Montant',
      'Fournisseur',
      'Date',
      'N° Facture',
      'Validation',
      'Temps (ms)',
      'Coût (FCFA)'
    ];

    const rows = result.results.map(r => {
      if (!r.success) {
        return [
          r.file.name,
          'Échec',
          '-',
          '-',
          '-',
          '-',
          '-',
          '-',
          '-',
          r.processingTime.toString(),
          '0'
        ];
      }

      const ocr = r.ocrResult!;
      const data = ocr.extractedData;

      return [
        r.file.name,
        'Succès',
        ocr.provider,
        ocr.confidence.toString(),
        data.total?.toString() || '-',
        data.vendorName || '-',
        data.dates?.[0] || '-',
        data.invoiceNumber || '-',
        r.validation?.isValid ? 'Valide' : 'Avertissements',
        r.processingTime.toString(),
        ocr.cost.toString()
      ];
    });

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csv;
  }

  /**
   * Télécharge les résultats en CSV
   */
  downloadCSV(result: BatchOCRResult, filename = 'batch_ocr_results.csv'): void {
    const csv = this.exportToCSV(result);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Génère un rapport HTML des résultats
   */
  generateHTMLReport(result: BatchOCRResult): string {
    const { summary } = result;
    const successRate = (summary.successful / summary.total * 100).toFixed(1);

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Rapport Batch OCR</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .summary { background: #f0f0f0; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    .summary h2 { margin-top: 0; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
    .stat { background: white; padding: 15px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .stat-value { font-size: 24px; font-weight: bold; color: #2563eb; }
    .stat-label { color: #666; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #2563eb; color: white; }
    tr:hover { background: #f5f5f5; }
    .success { color: #10b981; font-weight: bold; }
    .error { color: #ef4444; font-weight: bold; }
  </style>
</head>
<body>
  <div class="summary">
    <h2>📊 Rapport Batch OCR</h2>
    <p>Généré le ${new Date().toLocaleString('fr-FR')}</p>
    
    <div class="stats">
      <div class="stat">
        <div class="stat-value">${summary.total}</div>
        <div class="stat-label">Fichiers traités</div>
      </div>
      <div class="stat">
        <div class="stat-value">${summary.successful}</div>
        <div class="stat-label">Succès</div>
      </div>
      <div class="stat">
        <div class="stat-value">${summary.failed}</div>
        <div class="stat-label">Échecs</div>
      </div>
      <div class="stat">
        <div class="stat-value">${successRate}%</div>
        <div class="stat-label">Taux de réussite</div>
      </div>
      <div class="stat">
        <div class="stat-value">${(summary.totalTime / 1000).toFixed(1)}s</div>
        <div class="stat-label">Temps total</div>
      </div>
      <div class="stat">
        <div class="stat-value">${summary.totalCost} FCFA</div>
        <div class="stat-label">Coût total</div>
      </div>
    </div>
  </div>

  <h3>📄 Détails des fichiers</h3>
  <table>
    <thead>
      <tr>
        <th>Fichier</th>
        <th>Statut</th>
        <th>Provider</th>
        <th>Confiance</th>
        <th>Montant</th>
        <th>Fournisseur</th>
        <th>Temps</th>
      </tr>
    </thead>
    <tbody>
      ${result.results.map(r => `
        <tr>
          <td>${r.file.name}</td>
          <td class="${r.success ? 'success' : 'error'}">
            ${r.success ? '✅ Succès' : '❌ Échec'}
          </td>
          <td>${r.success ? r.ocrResult?.provider : '-'}</td>
          <td>${r.success ? r.ocrResult?.confidence + '%' : '-'}</td>
          <td>${r.success && r.ocrResult?.extractedData.total ? r.ocrResult.extractedData.total + ' FCFA' : '-'}</td>
          <td>${r.success ? r.ocrResult?.extractedData.vendorName || '-' : '-'}</td>
          <td>${r.processingTime}ms</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>
    `;

    return html;
  }

  /**
   * Télécharge le rapport HTML
   */
  downloadHTMLReport(result: BatchOCRResult, filename = 'batch_ocr_report.html'): void {
    const html = this.generateHTMLReport(result);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Divise un tableau en chunks
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// Instance singleton
export const batchOcrService = new BatchOCRService();

export default BatchOCRService;
