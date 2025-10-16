/**
 * Service d'Export PDF Professionnel
 * 
 * Fonctionnalités:
 * - Export rapports de chantier en PDF
 * - Export plans de projet en PDF
 * - Templates professionnels avec branding
 * - Mise en page optimisée
 * 
 * @author IntuitionConcept BTP Platform
 * @version 1.0.0
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { GeneratedReport } from './ai/siteReportGenerator';
import type { ProjectPlan } from './ai/projectPlanGenerator';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PDFExportOptions {
  title: string;
  subtitle?: string;
  author?: string;
  logo?: string; // URL ou base64
  footer?: string;
  headerColor?: string;
  accentColor?: string;
}

// ============================================================================
// SERVICE D'EXPORT PDF
// ============================================================================

export class PDFExportService {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;
  private currentY: number = 20;
  
  // Couleurs par défaut
  private colors = {
    primary: [79, 70, 229], // Indigo
    secondary: [147, 51, 234], // Purple
    success: [34, 197, 94], // Green
    warning: [251, 146, 60], // Orange
    error: [239, 68, 68], // Red
    text: [31, 41, 55], // Gray-800
    textLight: [107, 114, 128], // Gray-500
    background: [249, 250, 251] // Gray-50
  };
  
  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }
  
  /**
   * Ajoute l'en-tête du document
   */
  private addHeader(options: PDFExportOptions) {
    const { title, subtitle, headerColor } = options;
    
    // Fond coloré pour l'en-tête
    const color = headerColor ? this.hexToRgb(headerColor) : this.colors.primary;
    this.doc.setFillColor(...color);
    this.doc.rect(0, 0, this.pageWidth, 40, 'F');
    
    // Titre
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, 20);
    
    // Sous-titre
    if (subtitle) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(subtitle, this.margin, 30);
    }
    
    this.currentY = 50;
  }
  
  /**
   * Ajoute le pied de page
   */
  private addFooter(options: PDFExportOptions, pageNumber: number) {
    const { footer, author } = options;
    
    this.doc.setFontSize(8);
    this.doc.setTextColor(...this.colors.textLight);
    this.doc.setFont('helvetica', 'normal');
    
    // Texte du pied de page
    const footerText = footer || 'IntuitionConcept BTP Platform';
    this.doc.text(footerText, this.margin, this.pageHeight - 10);
    
    // Numéro de page
    this.doc.text(
      `Page ${pageNumber}`,
      this.pageWidth - this.margin - 20,
      this.pageHeight - 10
    );
    
    // Auteur et date
    if (author) {
      const dateStr = new Date().toLocaleDateString('fr-FR');
      this.doc.text(
        `${author} - ${dateStr}`,
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: 'center' }
      );
    }
  }
  
  /**
   * Ajoute une section
   */
  private addSection(title: string, content: string) {
    // Vérifier si on a besoin d'une nouvelle page
    if (this.currentY > this.pageHeight - 60) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
    
    // Titre de section
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.colors.primary);
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 8;
    
    // Contenu
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...this.colors.text);
    
    const lines = this.doc.splitTextToSize(
      content,
      this.pageWidth - (this.margin * 2)
    );
    
    lines.forEach((line: string) => {
      if (this.currentY > this.pageHeight - 30) {
        this.doc.addPage();
        this.currentY = this.margin;
      }
      this.doc.text(line, this.margin, this.currentY);
      this.currentY += 5;
    });
    
    this.currentY += 5; // Espacement après la section
  }
  
  /**
   * Ajoute un tableau
   */
  private addTable(headers: string[], rows: string[][]) {
    if (this.currentY > this.pageHeight - 60) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
    
    autoTable(this.doc, {
      startY: this.currentY,
      head: [headers],
      body: rows,
      theme: 'grid',
      headStyles: {
        fillColor: this.colors.primary,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9,
        textColor: this.colors.text
      },
      alternateRowStyles: {
        fillColor: this.colors.background
      },
      margin: { left: this.margin, right: this.margin }
    });
    
    // @ts-ignore - autoTable modifie doc
    this.currentY = this.doc.lastAutoTable.finalY + 10;
  }
  
  /**
   * Ajoute une boîte d'alerte
   */
  private addAlert(type: 'success' | 'warning' | 'error' | 'info', message: string) {
    if (this.currentY > this.pageHeight - 40) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
    
    const colorMap = {
      success: this.colors.success,
      warning: this.colors.warning,
      error: this.colors.error,
      info: this.colors.primary
    };
    
    const color = colorMap[type];
    
    // Fond de l'alerte
    this.doc.setFillColor(...color, 0.1);
    this.doc.roundedRect(this.margin, this.currentY - 5, this.pageWidth - (this.margin * 2), 15, 2, 2, 'F');
    
    // Bordure
    this.doc.setDrawColor(...color);
    this.doc.setLineWidth(0.5);
    this.doc.roundedRect(this.margin, this.currentY - 5, this.pageWidth - (this.margin * 2), 15, 2, 2, 'S');
    
    // Texte
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...color);
    this.doc.text(message, this.margin + 5, this.currentY + 3);
    
    this.currentY += 20;
  }
  
  /**
   * Convertit hex en RGB
   */
  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16)
        ]
      : this.colors.primary;
  }
  
  /**
   * Exporte un rapport de chantier en PDF
   */
  exportSiteReport(report: GeneratedReport, options: PDFExportOptions): Blob {
    // En-tête
    this.addHeader({
      ...options,
      title: options.title || 'Rapport de Chantier',
      subtitle: new Date(report.reportDate).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    });
    
    // Résumé exécutif
    this.addSection('📊 Résumé Exécutif', report.executiveSummary);
    
    // Statistiques
    this.currentY += 5;
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.colors.primary);
    this.doc.text('📈 Statistiques', this.margin, this.currentY);
    this.currentY += 10;
    
    const statsRows = [
      ['Progression', report.statistics.progressChange],
      ['Productivité', report.statistics.workersProductivity],
      ['Matériaux', report.statistics.materialsConsumption],
      ['Budget', report.statistics.budgetStatus]
    ];
    
    this.addTable(['Indicateur', 'Valeur'], statsRows);
    
    // Alertes
    if (report.alerts.length > 0) {
      this.currentY += 5;
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(...this.colors.primary);
      this.doc.text('⚠️ Alertes & Points d\'Attention', this.margin, this.currentY);
      this.currentY += 10;
      
      report.alerts.forEach(alert => {
        const typeMap: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
          success: 'success',
          warning: 'warning',
          error: 'error',
          info: 'info'
        };
        this.addAlert(typeMap[alert.type] || 'info', `[${alert.priority.toUpperCase()}] ${alert.message}`);
      });
    }
    
    // Sections détaillées
    report.detailedSections.forEach(section => {
      this.addSection(section.title, section.content);
      
      // Sous-sections
      if (section.subsections) {
        section.subsections.forEach(sub => {
          this.doc.setFontSize(12);
          this.doc.setFont('helvetica', 'bold');
          this.doc.setTextColor(...this.colors.secondary);
          this.doc.text(`  ${sub.subtitle}`, this.margin + 5, this.currentY);
          this.currentY += 6;
          
          this.doc.setFontSize(10);
          this.doc.setFont('helvetica', 'normal');
          this.doc.setTextColor(...this.colors.text);
          const subLines = this.doc.splitTextToSize(sub.content, this.pageWidth - (this.margin * 2) - 10);
          subLines.forEach((line: string) => {
            if (this.currentY > this.pageHeight - 30) {
              this.doc.addPage();
              this.currentY = this.margin;
            }
            this.doc.text(line, this.margin + 10, this.currentY);
            this.currentY += 5;
          });
          this.currentY += 3;
        });
      }
    });
    
    // Recommandations
    if (report.recommendations.length > 0) {
      this.currentY += 5;
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(...this.colors.success);
      this.doc.text('💡 Recommandations', this.margin, this.currentY);
      this.currentY += 10;
      
      report.recommendations.forEach((rec, index) => {
        if (this.currentY > this.pageHeight - 30) {
          this.doc.addPage();
          this.currentY = this.margin;
        }
        
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(...this.colors.text);
        this.doc.text(`${index + 1}. ${rec}`, this.margin + 5, this.currentY);
        this.currentY += 6;
      });
    }
    
    // Pied de page sur toutes les pages
    const totalPages = this.doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      this.addFooter(options, i);
    }
    
    return this.doc.output('blob');
  }
  
  /**
   * Exporte un plan de projet en PDF
   */
  exportProjectPlan(plan: ProjectPlan, options: PDFExportOptions): Blob {
    // En-tête
    this.addHeader({
      ...options,
      title: options.title || 'Plan de Projet Détaillé',
      subtitle: `${plan.phases.length} phases - Généré le ${new Date().toLocaleDateString('fr-FR')}`
    });
    
    // Vue d'ensemble
    this.addSection(
      '📋 Vue d\'Ensemble',
      `Ce plan de projet comprend ${plan.phases.length} phases principales avec un total de ${plan.phases.reduce((acc, p) => acc + p.subTasks.length, 0)} tâches détaillées.`
    );
    
    // Phases détaillées
    plan.phases.forEach((phase, phaseIndex) => {
      // Nouvelle page pour chaque phase
      if (phaseIndex > 0) {
        this.doc.addPage();
        this.currentY = this.margin;
      }
      
      // Titre de phase
      this.doc.setFontSize(16);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(...this.colors.primary);
      this.doc.text(`Phase ${phaseIndex + 1}: ${phase.name}`, this.margin, this.currentY);
      this.currentY += 8;
      
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(...this.colors.textLight);
      this.doc.text(`Durée: ${phase.duration} | ${phase.subTasks.length} tâches`, this.margin, this.currentY);
      this.currentY += 10;
      
      // Risques de la phase
      if (phase.risks.length > 0) {
        phase.risks.forEach(risk => {
          this.addAlert('warning', risk);
        });
      }
      
      // Tâches
      phase.subTasks.forEach((task, taskIndex) => {
        if (this.currentY > this.pageHeight - 80) {
          this.doc.addPage();
          this.currentY = this.margin;
        }
        
        // Titre de tâche
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(...this.colors.secondary);
        this.doc.text(`${phaseIndex + 1}.${taskIndex + 1} ${task.name}`, this.margin + 5, this.currentY);
        this.currentY += 6;
        
        // Détails de la tâche
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(...this.colors.text);
        
        const details = [
          `Corps de métier: ${task.tradeSkill}`,
          `Durée: ${task.duration}`,
          `Main d'œuvre: ${task.workforce}`
        ];
        
        details.forEach(detail => {
          this.doc.text(detail, this.margin + 10, this.currentY);
          this.currentY += 5;
        });
        
        // Matériaux
        if (task.materials.length > 0) {
          this.currentY += 2;
          this.doc.setFont('helvetica', 'bold');
          this.doc.text('Matériaux:', this.margin + 10, this.currentY);
          this.currentY += 5;
          
          this.doc.setFont('helvetica', 'normal');
          task.materials.forEach(mat => {
            this.doc.text(`• ${mat.name}: ${mat.quantity} ${mat.unit}`, this.margin + 15, this.currentY);
            this.currentY += 4;
          });
        }
        
        this.currentY += 5;
      });
    });
    
    // Pied de page
    const totalPages = this.doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      this.addFooter(options, i);
    }
    
    return this.doc.output('blob');
  }
  
  /**
   * Télécharge le PDF
   */
  downloadPDF(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Instance singleton
export const pdfExportService = new PDFExportService();
