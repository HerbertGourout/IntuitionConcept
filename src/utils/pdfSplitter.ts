/**
 * Service de découpe PDF sans perte de qualité
 * 
 * Objectifs:
 * - Découper un PDF en pages individuelles SANS COMPRESSION
 * - Préserver 100% de la qualité originale
 * - Extraire métadonnées complètes
 * - Support des PDF volumineux (>100 MB)
 * 
 * @author IntuitionConcept BTP Platform
 * @version 1.0.0
 */

import { PDFDocument } from 'pdf-lib';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PDFSplitOptions {
  preserveMetadata: boolean; // Conserver métadonnées originales
  preserveQuality: boolean; // Aucune compression
  extractImages: boolean; // Extraire images haute résolution
  includeAnnotations: boolean; // Conserver annotations
  maxFileSize?: number; // Taille max par fichier (bytes), null = illimité
}

export interface PDFPageInfo {
  pageNumber: number;
  width: number;
  height: number;
  rotation: number;
  hasText: boolean;
  hasImages: boolean;
  hasAnnotations: boolean;
  estimatedSize: number; // En bytes
}

export interface PDFSplitResult {
  pages: Array<{
    pageNumber: number;
    pdfBytes: Uint8Array;
    base64: string;
    metadata: PDFPageInfo;
  }>;
  originalMetadata: PDFMetadata;
  totalSize: number;
  splitDuration: number; // En ms
}

export interface PDFMetadata {
  fileName: string;
  fileSize: number;
  mimeType: string;
  pageCount: number;
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
  pdfVersion?: string;
}

// ============================================================================
// SERVICE PRINCIPAL
// ============================================================================

export class PDFSplitter {
  private static readonly DEFAULT_OPTIONS: PDFSplitOptions = {
    preserveMetadata: true,
    preserveQuality: true,
    extractImages: true,
    includeAnnotations: true,
    maxFileSize: undefined // Pas de limite
  };

  /**
   * Découpe un PDF en pages individuelles sans perte
   */
  static async splitPDF(
    file: File,
    options: Partial<PDFSplitOptions> = {}
  ): Promise<PDFSplitResult> {
    const startTime = Date.now();
    const opts = { ...PDFSplitter.DEFAULT_OPTIONS, ...options };

    console.log('📄 Découpe PDF sans compression:', file.name);
    console.log('⚙️ Options:', opts);

    // Charger le PDF original
    const arrayBuffer = await file.arrayBuffer();
    const originalPdf = await PDFDocument.load(arrayBuffer, {
      updateMetadata: false, // Ne pas modifier les métadonnées
      ignoreEncryption: false, // Respecter le chiffrement
      throwOnInvalidObject: false // Tolérer les objets invalides
    });

    // Extraire métadonnées
    const metadata = await PDFSplitter.extractMetadata(file, originalPdf);
    console.log('📊 Métadonnées:', metadata);

    // Analyser chaque page
    const pageInfos = await PDFSplitter.analyzePages(originalPdf);
    console.log(`📑 ${pageInfos.length} pages analysées`);

    // Découper en pages individuelles
    const pages: PDFSplitResult['pages'] = [];
    let totalSize = 0;

    for (let i = 0; i < originalPdf.getPageCount(); i++) {
      console.log(`✂️ Découpe page ${i + 1}/${originalPdf.getPageCount()}`);

      // Créer un nouveau document pour cette page
      const singlePagePdf = await PDFDocument.create();

      // Copier la page (sans compression)
      const [copiedPage] = await singlePagePdf.copyPages(originalPdf, [i]);
      singlePagePdf.addPage(copiedPage);

      // Copier les métadonnées si demandé
      if (opts.preserveMetadata) {
        PDFSplitter.copyMetadata(originalPdf, singlePagePdf);
      }

      // Sauvegarder SANS COMPRESSION
      const pdfBytes = await singlePagePdf.save({
        useObjectStreams: false, // Désactiver compression des objets
        addDefaultPage: false,
        objectsPerTick: Infinity, // Traiter tous les objets d'un coup
        updateFieldAppearances: false // Ne pas régénérer les apparences
      });

      // Convertir en base64
      const base64 = PDFSplitter.uint8ArrayToBase64(pdfBytes);

      pages.push({
        pageNumber: i + 1,
        pdfBytes,
        base64,
        metadata: pageInfos[i]
      });

      totalSize += pdfBytes.length;

      console.log(`✅ Page ${i + 1} extraite: ${(pdfBytes.length / 1024).toFixed(2)} KB`);
    }

    const splitDuration = Date.now() - startTime;

    console.log(`🎉 Découpe terminée en ${splitDuration}ms`);
    console.log(`📦 Taille totale: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

    return {
      pages,
      originalMetadata: metadata,
      totalSize,
      splitDuration
    };
  }

  /**
   * Extrait les métadonnées complètes d'un PDF
   */
  static async extractMetadata(file: File, pdfDoc: PDFDocument): Promise<PDFMetadata> {
    const title = pdfDoc.getTitle();
    const author = pdfDoc.getAuthor();
    const subject = pdfDoc.getSubject();
    const keywords = pdfDoc.getKeywords();
    const creator = pdfDoc.getCreator();
    const producer = pdfDoc.getProducer();
    const creationDate = pdfDoc.getCreationDate();
    const modificationDate = pdfDoc.getModificationDate();

    // Extraire version PDF depuis le header
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const header = new TextDecoder().decode(bytes.slice(0, 8));
    const versionMatch = header.match(/%PDF-(\d\.\d)/);
    const pdfVersion = versionMatch ? versionMatch[1] : undefined;

    return {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      pageCount: pdfDoc.getPageCount(),
      title: title || undefined,
      author: author || undefined,
      subject: subject || undefined,
      keywords: keywords ? keywords.split(',').map(k => k.trim()).filter(Boolean) : undefined,
      creator: creator || undefined,
      producer: producer || undefined,
      creationDate: creationDate || undefined,
      modificationDate: modificationDate || undefined,
      pdfVersion
    };
  }

  /**
   * Analyse les caractéristiques de chaque page
   */
  static async analyzePages(pdfDoc: PDFDocument): Promise<PDFPageInfo[]> {
    const pageInfos: PDFPageInfo[] = [];

    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();
      const rotation = page.getRotation().angle;

      // Détecter présence de texte (approximatif)
      const hasText = page.node.Contents() !== undefined;

      // Détecter présence d'images (approximatif)
      const resources = page.node.Resources();
      const hasImages = resources?.lookup(page.node.context.obj('XObject')) !== undefined;

      // Détecter annotations
      const hasAnnotations = page.node.Annots() !== undefined;

      // Estimer la taille (très approximatif)
      const estimatedSize = Math.floor((width * height) / 10); // Heuristique simple

      pageInfos.push({
        pageNumber: i + 1,
        width,
        height,
        rotation,
        hasText,
        hasImages,
        hasAnnotations,
        estimatedSize
      });
    }

    return pageInfos;
  }

  /**
   * Copie les métadonnées d'un PDF vers un autre
   */
  private static copyMetadata(source: PDFDocument, target: PDFDocument): void {
    const title = source.getTitle();
    const author = source.getAuthor();
    const subject = source.getSubject();
    const keywords = source.getKeywords();
    const creator = source.getCreator();
    const producer = source.getProducer();

    if (title) target.setTitle(title);
    if (author) target.setAuthor(author);
    if (subject) target.setSubject(subject);
    if (keywords) target.setKeywords(keywords.split(',').map(k => k.trim()));
    if (creator) target.setCreator(creator);
    if (producer) target.setProducer(producer);

    // Conserver les dates
    const creationDate = source.getCreationDate();
    const modificationDate = source.getModificationDate();
    
    if (creationDate) target.setCreationDate(creationDate);
    if (modificationDate) target.setModificationDate(modificationDate);
  }

  /**
   * Convertit Uint8Array en Base64
   */
  private static uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convertit Base64 en Uint8Array
   */
  static base64ToUint8Array(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Fusionne plusieurs pages en un seul PDF
   */
  static async mergePages(pages: Uint8Array[]): Promise<Uint8Array> {
    const mergedPdf = await PDFDocument.create();

    for (const pageBytes of pages) {
      const pagePdf = await PDFDocument.load(pageBytes);
      const [copiedPage] = await mergedPdf.copyPages(pagePdf, [0]);
      mergedPdf.addPage(copiedPage);
    }

    return await mergedPdf.save({
      useObjectStreams: false,
      addDefaultPage: false,
      objectsPerTick: Infinity
    });
  }

  /**
   * Valide qu'un fichier est un PDF valide
   */
  static async validatePDF(file: File): Promise<{ valid: boolean; error?: string }> {
    try {
      // Vérifier l'extension
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        return { valid: false, error: 'Extension de fichier invalide' };
      }

      // Vérifier le MIME type
      if (file.type !== 'application/pdf') {
        return { valid: false, error: 'Type MIME invalide' };
      }

      // Tenter de charger le PDF
      const arrayBuffer = await file.arrayBuffer();
      await PDFDocument.load(arrayBuffer);

      return { valid: true };

    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Obtient des statistiques sur un PDF
   */
  static async getPDFStats(file: File): Promise<{
    pageCount: number;
    totalSize: number;
    averagePageSize: number;
    hasImages: boolean;
    hasText: boolean;
    isEncrypted: boolean;
  }> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, {
      updateMetadata: false,
      ignoreEncryption: true
    });

    const pageCount = pdfDoc.getPageCount();
    const totalSize = file.size;
    const averagePageSize = totalSize / pageCount;

    // Analyser première page pour détecter contenu
    const firstPage = pdfDoc.getPage(0);
    const hasText = firstPage.node.Contents() !== undefined;
    const resources = firstPage.node.Resources();
    const hasImages = resources?.lookup(firstPage.node.context.obj('XObject')) !== undefined;

    // Détecter chiffrement (approximatif)
    const bytes = new Uint8Array(arrayBuffer);
    const header = new TextDecoder().decode(bytes.slice(0, 100));
    const isEncrypted = header.includes('/Encrypt');

    return {
      pageCount,
      totalSize,
      averagePageSize,
      hasImages,
      hasText,
      isEncrypted
    };
  }
}

// ============================================================================
// FONCTIONS UTILITAIRES EXPORTÉES
// ============================================================================

/**
 * Découpe rapide d'un PDF (fonction helper)
 */
export async function splitPDFFile(file: File): Promise<PDFSplitResult> {
  return PDFSplitter.splitPDF(file);
}

/**
 * Extrait uniquement les métadonnées
 */
export async function extractPDFMetadata(file: File): Promise<PDFMetadata> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, {
    updateMetadata: false
  });
  
  return PDFSplitter.extractMetadata(file, pdfDoc);
}

/**
 * Valide un fichier PDF
 */
export async function validatePDFFile(file: File): Promise<boolean> {
  const result = await PDFSplitter.validatePDF(file);
  return result.valid;
}

/**
 * Obtient les statistiques d'un PDF
 */
export async function getPDFFileStats(file: File) {
  return PDFSplitter.getPDFStats(file);
}
