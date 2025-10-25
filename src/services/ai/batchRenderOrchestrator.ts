/**
 * Orchestrateur de génération batch de rendus 3D
 * Gère la file d'attente, la progression, l'annulation et le retry
 */

import {
  ViewSpec,
  GeneratedView,
  ArchitecturalAnalysis,
  GlobalRenderSettings
} from '../../types/architecturalAnalysis';
import { Render3DRequest, RenderProgress } from './render3DService';
import render3DService from './render3DService';
import { enrichedPromptBuilder } from './enrichedPromptBuilder';

export interface BatchJob {
  id: string;
  viewSpec: ViewSpec;
  planImageBase64: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  result?: GeneratedView;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface BatchProgress {
  totalJobs: number;
  completed: number;
  failed: number;
  cancelled: number;
  inProgress: number;
  queued: number;
  overallProgress: number; // 0-100
  estimatedTimeRemaining?: number; // secondes
}

class BatchRenderOrchestrator {
  private jobs: Map<string, BatchJob> = new Map();
  private activeJobs: Set<string> = new Set();
  private maxConcurrency = 2; // Limite Replicate
  private abortController: AbortController | null = null;
  private progressCallbacks: Map<string, (progress: BatchProgress) => void> = new Map();

  /**
   * Initialise un batch de génération
   */
  async startBatch(
    viewSpecs: ViewSpec[],
    planImages: Map<number, string>, // pageIndex -> base64
    analysis: ArchitecturalAnalysis,
    globalSettings: GlobalRenderSettings,
    onProgress?: (progress: BatchProgress) => void
  ): Promise<string> {
    const batchId = `batch-${Date.now()}`;
    this.abortController = new AbortController();

    if (onProgress) {
      this.progressCallbacks.set(batchId, onProgress);
    }

    // Créer les jobs
    for (const viewSpec of viewSpecs) {
      const pageIndex = viewSpec.pageIndex;
      const planImageBase64 = pageIndex !== undefined ? planImages.get(pageIndex) : null;

      if (!planImageBase64) {
        console.warn(`Pas d'image pour la vue ${viewSpec.id}, skip`);
        continue;
      }

      const job: BatchJob = {
        id: `${batchId}-${viewSpec.id}`,
        viewSpec,
        planImageBase64,
        status: 'queued',
        progress: 0
      };

      this.jobs.set(job.id, job);
    }

    // Lancer le traitement
    this.processBatch(batchId, analysis, globalSettings);

    return batchId;
  }

  /**
   * Traite le batch avec concurrence contrôlée
   */
  private async processBatch(
    batchId: string,
    analysis: ArchitecturalAnalysis,
    globalSettings: GlobalRenderSettings
  ): Promise<void> {
    const batchJobs = Array.from(this.jobs.values()).filter(j => j.id.startsWith(batchId));

    // Traiter par vagues (concurrence limitée)
    while (batchJobs.some(j => j.status === 'queued' || j.status === 'processing')) {
      // Lancer de nouveaux jobs si capacité disponible
      const availableSlots = this.maxConcurrency - this.activeJobs.size;
      const queuedJobs = batchJobs.filter(j => j.status === 'queued').slice(0, availableSlots);

      for (const job of queuedJobs) {
        this.processJob(job, analysis, globalSettings, batchId);
      }

      // Attendre un peu avant de vérifier à nouveau
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Vérifier si annulé
      if (this.abortController?.signal.aborted) {
        this.cancelBatch(batchId);
        break;
      }
    }

    // Notifier fin du batch
    this.notifyProgress(batchId);
  }

  /**
   * Traite un job individuel
   */
  private async processJob(
    job: BatchJob,
    analysis: ArchitecturalAnalysis,
    globalSettings: GlobalRenderSettings,
    batchId: string
  ): Promise<void> {
    job.status = 'processing';
    job.startedAt = new Date();
    this.activeJobs.add(job.id);
    this.notifyProgress(batchId);

    try {
      // Construire le prompt enrichi
      const prompt = enrichedPromptBuilder.buildPrompt(job.viewSpec, analysis, globalSettings);
      const negativePrompt = enrichedPromptBuilder.buildNegativePrompt(job.viewSpec);

      // Préparer la requête
      const request: Render3DRequest = {
        planImage: job.planImageBase64,
        style: this.mapStyleToLegacy(analysis.project.style),
        viewAngle: job.viewSpec.viewAngle,
        timeOfDay: job.viewSpec.timeOfDay,
        quality: this.mapQualityToLegacy(job.viewSpec.quality),
        numVariations: 1,
        model: job.viewSpec.model
      };

      // Générer
      const results = await render3DService.generate3DRenderWithProgress(
        request,
        (progress: RenderProgress) => {
          job.progress = progress.progress;
          this.notifyProgress(batchId);
        }
      );

      if (results.length > 0) {
        const result = results[0];
        job.result = {
          id: job.id,
          spec: job.viewSpec,
          imageUrl: result.imageUrl,
          thumbnailUrl: result.thumbnailUrl,
          prompt,
          negativePrompt,
          model: result.style,
          generatedAt: result.generatedAt,
          processingTime: result.processingTime,
          cost: result.cost,
          status: 'completed',
          progress: 100
        };
        job.status = 'completed';
        job.progress = 100;
      } else {
        throw new Error('Aucun résultat généré');
      }
    } catch (error) {
      console.error(`Erreur job ${job.id}:`, error);
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Erreur inconnue';
    } finally {
      job.completedAt = new Date();
      this.activeJobs.delete(job.id);
      this.notifyProgress(batchId);
    }
  }

  /**
   * Annule un batch
   */
  cancelBatch(batchId: string): void {
    const batchJobs = Array.from(this.jobs.values()).filter(j => j.id.startsWith(batchId));

    for (const job of batchJobs) {
      if (job.status === 'queued' || job.status === 'processing') {
        job.status = 'cancelled';
      }
    }

    this.abortController?.abort();
    this.notifyProgress(batchId);
  }

  /**
   * Retry un job échoué
   */
  async retryJob(
    jobId: string,
    analysis: ArchitecturalAnalysis,
    globalSettings: GlobalRenderSettings
  ): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'failed') return;

    job.status = 'queued';
    job.error = undefined;
    job.progress = 0;

    const batchId = jobId.split('-').slice(0, 2).join('-');
    await this.processJob(job, analysis, globalSettings, batchId);
  }

  /**
   * Récupère la progression d'un batch
   */
  getBatchProgress(batchId: string): BatchProgress {
    const batchJobs = Array.from(this.jobs.values()).filter(j => j.id.startsWith(batchId));

    const completed = batchJobs.filter(j => j.status === 'completed').length;
    const failed = batchJobs.filter(j => j.status === 'failed').length;
    const cancelled = batchJobs.filter(j => j.status === 'cancelled').length;
    const inProgress = batchJobs.filter(j => j.status === 'processing').length;
    const queued = batchJobs.filter(j => j.status === 'queued').length;

    const overallProgress = batchJobs.length > 0
      ? Math.round((completed / batchJobs.length) * 100)
      : 0;

    // Estimation temps restant
    const completedJobs = batchJobs.filter(j => j.status === 'completed' && j.startedAt && j.completedAt);
    const avgTime = completedJobs.length > 0
      ? completedJobs.reduce((sum, j) => sum + (j.completedAt!.getTime() - j.startedAt!.getTime()), 0) / completedJobs.length / 1000
      : 60; // 60s par défaut

    const remainingJobs = queued + inProgress;
    const estimatedTimeRemaining = remainingJobs > 0 ? Math.round(remainingJobs * avgTime / this.maxConcurrency) : 0;

    return {
      totalJobs: batchJobs.length,
      completed,
      failed,
      cancelled,
      inProgress,
      queued,
      overallProgress,
      estimatedTimeRemaining
    };
  }

  /**
   * Récupère tous les jobs d'un batch
   */
  getBatchJobs(batchId: string): BatchJob[] {
    return Array.from(this.jobs.values()).filter(j => j.id.startsWith(batchId));
  }

  /**
   * Récupère les résultats complétés
   */
  getCompletedResults(batchId: string): GeneratedView[] {
    return Array.from(this.jobs.values())
      .filter(j => j.id.startsWith(batchId) && j.status === 'completed' && j.result)
      .map(j => j.result!);
  }

  /**
   * Notifie la progression
   */
  private notifyProgress(batchId: string): void {
    const callback = this.progressCallbacks.get(batchId);
    if (callback) {
      const progress = this.getBatchProgress(batchId);
      callback(progress);
    }
  }

  /**
   * Mapping style vers format legacy
   */
  private mapStyleToLegacy(style: string): Render3DRequest['style'] {
    const mapping: Record<string, Render3DRequest['style']> = {
      'moderne': '3d-modern',
      'contemporain': '3d-modern',
      'traditionnel': '3d-traditional',
      'industriel': '3d-industrial',
      'minimaliste': '3d-minimalist',
      'mediterraneen': '3d-traditional',
      'classique': '3d-traditional'
    };
    return mapping[style] || '3d-modern';
  }

  /**
   * Mapping qualité vers format legacy
   */
  private mapQualityToLegacy(quality: string): 'draft' | 'standard' | 'hd' {
    const mapping: Record<string, 'draft' | 'standard' | 'hd'> = {
      'draft': 'draft',
      'standard': 'standard',
      'hd': 'hd',
      '4k': 'hd',
      '8k': 'hd'
    };
    return mapping[quality] || 'standard';
  }

  /**
   * Nettoie un batch terminé
   */
  clearBatch(batchId: string): void {
    const batchJobs = Array.from(this.jobs.keys()).filter(k => k.startsWith(batchId));
    for (const jobId of batchJobs) {
      this.jobs.delete(jobId);
    }
    this.progressCallbacks.delete(batchId);
  }
}

export const batchRenderOrchestrator = new BatchRenderOrchestrator();
export default batchRenderOrchestrator;
