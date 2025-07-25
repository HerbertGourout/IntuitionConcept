import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PurchaseOrder, PurchaseOrderItem } from '../types/purchaseOrder';

export class PDFService {
  /**
   * Génère un PDF pour un bon d'achat
   */
  static async generatePurchaseOrderPDF(
    purchaseOrder: PurchaseOrder,
    supplierName: string = 'Fournisseur non spécifié',
    projectName: string = 'Projet non spécifié'
  ): Promise<void> {
    try {
      // Créer un nouveau document PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Configuration des couleurs
      const primaryColor: [number, number, number] = [59, 130, 246]; // Blue-600
      const secondaryColor: [number, number, number] = [107, 114, 128]; // Gray-500
      const textColor: [number, number, number] = [31, 41, 55]; // Gray-800
      
      let yPosition = 20;
      
      // === EN-TÊTE ===
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      // Logo et titre
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('BON D\'ACHAT', 20, 25);
      
      // Numéro de bon d'achat
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`N° ${purchaseOrder.orderNumber}`, pageWidth - 60, 25);
      
      yPosition = 55;
      
      // === INFORMATIONS GÉNÉRALES ===
      pdf.setTextColor(...textColor);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INFORMATIONS GÉNÉRALES', 20, yPosition);
      yPosition += 10;
      
      // Ligne de séparation
      pdf.setDrawColor(...primaryColor);
      pdf.setLineWidth(0.5);
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 10;
      
      // Informations en deux colonnes
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      
      // Colonne gauche
      const leftColumn = 20;
      const rightColumn = pageWidth / 2 + 10;
      
      pdf.text('Date de création:', leftColumn, yPosition);
      pdf.text(new Date(purchaseOrder.createdAt).toLocaleDateString('fr-FR'), leftColumn + 35, yPosition);
      
      pdf.text('Statut:', rightColumn, yPosition);
      pdf.text(this.getStatusLabel(purchaseOrder.status), rightColumn + 20, yPosition);
      yPosition += 8;
      
      pdf.text('Projet:', leftColumn, yPosition);
      pdf.text(projectName, leftColumn + 35, yPosition);
      
      pdf.text('Fournisseur:', rightColumn, yPosition);
      pdf.text(supplierName, rightColumn + 30, yPosition);
      yPosition += 8;
      
      if (purchaseOrder.requestedDeliveryDate) {
        pdf.text('Livraison prévue:', leftColumn, yPosition);
        pdf.text(new Date(purchaseOrder.requestedDeliveryDate).toLocaleDateString('fr-FR'), leftColumn + 40, yPosition);
        yPosition += 8;
      }
      
      yPosition += 10;
      
      // === ARTICLES ===
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ARTICLES COMMANDÉS', 20, yPosition);
      yPosition += 10;
      
      // Ligne de séparation
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 10;
      
      // En-têtes du tableau
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Description', 20, yPosition);
      pdf.text('Qté', 120, yPosition);
      pdf.text('Unité', 140, yPosition);
      pdf.text('Prix Unit.', 160, yPosition);
      pdf.text('Total', 180, yPosition);
      yPosition += 5;
      
      // Ligne sous les en-têtes
      pdf.setDrawColor(...secondaryColor);
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 8;
      
      // Articles
      pdf.setFont('helvetica', 'normal');
      let totalHT = 0;
      
      purchaseOrder.items.forEach((item: PurchaseOrderItem) => {
        const itemTotal = item.quantity * item.unitPrice;
        totalHT += itemTotal;
        
        // Vérifier si on a assez de place sur la page
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.text(item.description || 'Article', 20, yPosition);
        pdf.text(item.quantity.toString(), 120, yPosition);
        pdf.text(item.unit || 'unité', 140, yPosition);
        pdf.text(`${item.unitPrice.toFixed(2)} FCFA`, 160, yPosition);
        pdf.text(`${itemTotal.toFixed(2)} FCFA`, 180, yPosition);
        yPosition += 8;
      });
      
      yPosition += 10;
      
      // === TOTAUX ===
      pdf.setDrawColor(...primaryColor);
      pdf.setLineWidth(1);
      pdf.line(140, yPosition, pageWidth - 20, yPosition);
      yPosition += 8;
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Total HT:', 140, yPosition);
      pdf.text(`${totalHT.toFixed(2)} FCFA`, 180, yPosition);
      yPosition += 8;
      
      const tva = totalHT * 0.20; // TVA 20%
      pdf.setFont('helvetica', 'normal');
      pdf.text('TVA (20%):', 140, yPosition);
      pdf.text(`${tva.toFixed(2)} FCFA`, 180, yPosition);
      yPosition += 8;
      
      const totalTTC = totalHT + tva;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text('Total TTC:', 140, yPosition);
      pdf.text(`${totalTTC.toFixed(2)} FCFA`, 180, yPosition);
      
      // === NOTES ===
      if (purchaseOrder.notes) {
        yPosition += 20;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('NOTES:', 20, yPosition);
        yPosition += 8;
        
        pdf.setFont('helvetica', 'normal');
        const splitNotes = pdf.splitTextToSize(purchaseOrder.notes, pageWidth - 40);
        pdf.text(splitNotes, 20, yPosition);
      }
      
      // === PIED DE PAGE ===
      const footerY = pageHeight - 20;
      pdf.setFontSize(8);
      pdf.setTextColor(...secondaryColor);
      pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 20, footerY);
      pdf.text('Page 1 sur 1', pageWidth - 40, footerY);
      
      // Télécharger le PDF
      const fileName = `Bon_Achat_${purchaseOrder.orderNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log('✅ PDF généré avec succès:', fileName);
      
    } catch (error) {
      console.error('❌ Erreur lors de la génération du PDF:', error);
      throw new Error('Impossible de générer le PDF du bon d\'achat');
    }
  }
  
  /**
   * Convertit le statut en libellé français
   */
  private static getStatusLabel(status: string): string {
    const statusLabels: Record<string, string> = {
      'draft': 'Brouillon',
      'pending_approval': 'En attente d\'approbation',
      'approved': 'Approuvé',
      'ordered': 'Commandé',
      'partially_delivered': 'Partiellement livré',
      'delivered': 'Livré',
      'cancelled': 'Annulé'
    };
    
    return statusLabels[status] || status;
  }
  
  /**
   * Génère un PDF à partir d'un élément HTML (méthode alternative)
   */
  static async generatePDFFromHTML(elementId: string, fileName: string): Promise<void> {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Élément avec l'ID ${elementId} non trouvé`);
      }
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(fileName);
      console.log('✅ PDF généré avec succès depuis HTML:', fileName);
      
    } catch (error) {
      console.error('❌ Erreur lors de la génération du PDF depuis HTML:', error);
      throw new Error('Impossible de générer le PDF depuis l\'élément HTML');
    }
  }
}
