import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';
import { Quote } from '../quotesService';
import type { Phase, Task, Article } from '../../types/StructuredQuote';

// Blue model palette (classic business blue)
const colors = {
  primary: [0, 122, 204] as const, // blue
  primaryDark: [0, 96, 168] as const,
  slate: {
    50: [250, 250, 250] as const,
    100: [240, 243, 248] as const,
    200: [221, 232, 243] as const,
    300: [200, 215, 234] as const,
    500: [102, 112, 133] as const,
    600: [71, 85, 105] as const,
    700: [51, 65, 85] as const,
  },
  phaseText: [0, 96, 168] as const,
  taskBg: [232, 243, 252] as const, // very light blue
  taskText: [0, 96, 168] as const,
};

// Format currency for Francophone Africa (FCFA)
const formatMoney = (value: number) => {
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
  return `${formatted.replace(/[\u202F\u00A0]/g, ' ')} F CFA`;
};

// Convert a readonly RGB tuple to a mutable Color tuple expected by jspdf-autotable
const toColor = (c: readonly number[]): [number, number, number] => [c[0], c[1], c[2]];

// (Classic mode) No watermark/gradient helpers needed

/**
 * Génère un PDF moderne d'un devis avec design professionnel
 */
export const generateQuotePdf = (
  quote: Quote,
  branding?: {
    companyName?: string;
    companyAddress?: string;
    footerContact?: string;
    logoDataUrl?: string; // optional base64 image
    logoWidthPt?: number; // optional width in pt
  }
) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;
  
  // Header data with env fallbacks to avoid hardcoded defaults
  type ViteEnv = { env?: { [k: string]: string | undefined } };
  const meta = (import.meta as unknown as ViteEnv);
  const envName = meta.env?.VITE_COMPANY_NAME;
  const envAddr = meta.env?.VITE_COMPANY_ADDRESS;
  const companyName = branding?.companyName ?? envName ?? 'Intuition Concept';
  const companyAddress = branding?.companyAddress ?? envAddr ?? '';

  // Modern header: thin top rule, logo left, company block right, pill title centered
  doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setLineWidth(1);
  doc.line(marginX, 24, pageWidth - marginX, 24);

  let headerBottomY = 0;
  const logoMaxW = branding?.logoWidthPt ?? 80;
  const logoY = 34;
  const logoH = 32;
  let logoBottom = logoY; // default if no logo
  if (branding?.logoDataUrl) {
    try {
      doc.addImage(branding.logoDataUrl, 'PNG', marginX, logoY, logoMaxW, logoH, undefined, 'FAST');
      logoBottom = logoY + logoH;
    } catch {
      // ignore logo errors
    }
  }
  const rightBlockX = pageWidth - marginX - 240;
  // Company block on the right (wrapped address, dynamic height)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(colors.slate[700][0], colors.slate[700][1], colors.slate[700][2]);
  const nameY = 42;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(colors.slate[500][0], colors.slate[500][1], colors.slate[500][2]);
  const addrStartY = 58;
  const addrLineH = 12;
  let textBottom = nameY;
  // Avoid drawing company address in header; keep it only in footer
  const renderHeaderAddress = false;
  if (renderHeaderAddress && companyAddress) {
    const wrapped = doc.splitTextToSize(companyAddress, 240);
    wrapped.forEach((line: string, idx: number) => {
      const y = addrStartY + idx * addrLineH;
      doc.text(line, rightBlockX, y);
      textBottom = y;
    });
  }
  // Determine header bottom from the lower of logo or text block, add padding
  headerBottomY = Math.max(logoBottom, textBottom) + 14;

  // Centered pill title with subtle shadow and badges row (Variant A - sobre/premium)
  const title = 'Devis Commercial';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  const padX = 14;
  const tWidth = doc.getTextWidth(title) + padX * 2;
  const pillX = pageWidth / 2 - tWidth / 2;
  // Pill starts after dynamic header height
  const pillY = headerBottomY + 12;
  // Brand caption (company name) above the title, centered and subtle
  if (companyName) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(colors.slate[600][0], colors.slate[600][1], colors.slate[600][2]);
    doc.text(String(companyName).toUpperCase(), pageWidth / 2, pillY - 8, { align: 'center' });
  }
  // Soft, subtle shadow
  doc.setFillColor(colors.slate[200][0], colors.slate[200][1], colors.slate[200][2]);
  doc.setDrawColor(colors.slate[200][0], colors.slate[200][1], colors.slate[200][2]);
  doc.roundedRect(pillX + 1, pillY + 1, tWidth, 24, 10, 10, 'FD');
  // Main pill (darker stroke for premium look)
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setDrawColor(colors.primaryDark[0], colors.primaryDark[1], colors.primaryDark[2]);
  doc.roundedRect(pillX, pillY, tWidth, 24, 10, 10, 'FD');
  doc.setTextColor(255, 255, 255);
  // Baseline +1 for better vertical centering
  doc.text(title, pageWidth / 2, pillY + 17, { align: 'center' });
  
  // Option A: remove centered badges below the title; start info card a bit below the title
  let cursorY = pillY + 40; // slightly tighter spacing
  
  // Single info box with vertical divider
  const boxWidth = pageWidth - marginX * 2;
  const cardHeight = 120;
  const cardTop = cursorY;
  doc.setFillColor(255, 255, 255);
  // Info card border in primary blue to match the reference
  doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.roundedRect(marginX, cardTop, boxWidth, cardHeight, 6, 6, 'FD');
  // Vertical divider
  const centerX = marginX + boxWidth / 2;
  doc.line(centerX, cardTop, centerX, cardTop + cardHeight);
  
  // Box headers
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('INFORMATIONS CLIENT', marginX + 16, cardTop + 24);
  doc.text('DÉTAILS DU DEVIS', centerX + 16, cardTop + 24);
  
  // Card content
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.slate[700][0], colors.slate[700][1], colors.slate[700][2]);
  doc.setFontSize(10);
  
  let yInfo = cardTop + 45;
  const lineHeight = 15;
  
  if (quote.clientName) {
    doc.setFont('helvetica', 'bold');
    doc.text(String(quote.clientName), marginX + 16, yInfo);
    yInfo += lineHeight;
    doc.setFont('helvetica', 'normal');
  }
  if (quote.clientEmail) {
    doc.text(String(quote.clientEmail), marginX + 16, yInfo);
    yInfo += lineHeight;
  }
  if (quote.clientPhone) {
    doc.text(String(quote.clientPhone), marginX + 16, yInfo);
  }
  
  // Quote details
  const detailsX = marginX + boxWidth / 2 + 16;
  let yDetails = cardTop + 45;
  
  doc.text(`Référence: ${quote.id}`, detailsX, yDetails);
  yDetails += lineHeight;
  doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, detailsX, yDetails);
  yDetails += lineHeight;
  if (quote.validityDays) {
    doc.text(`Validité: ${quote.validityDays} jours`, detailsX, yDetails);
  }
  
  cursorY = cardTop + cardHeight + 30;
  
  // Build per-phase sections and tables
  let totalGeneral = 0;
  let latestFinalY = cursorY;
  (quote.phases || []).forEach((phase: Phase, phaseIdx: number) => {
    // Phase section title outside the table
    const rawName = phase.name || 'Phase';
    const startsWithPhase = /^\s*phase\b/i.test(rawName);
    const phaseTitle = startsWithPhase
      ? `${phaseIdx + 1}. ${rawName}`
      : `${phaseIdx + 1}. Phase ${phaseIdx + 1} - ${rawName}`;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text(phaseTitle, marginX, latestFinalY);
    // underline across width
    doc.setDrawColor(colors.slate[200][0], colors.slate[200][1], colors.slate[200][2]);
    doc.setLineWidth(0.5);
    doc.line(marginX, latestFinalY + 4, pageWidth - marginX, latestFinalY + 4);
    
    const rows: RowInput[] = [];
    let phaseTotal = 0;
    if (phase.tasks && phase.tasks.length > 0) {
      phase.tasks.forEach((task: Task) => {
        // Task header band
        rows.push([`${(task.name || 'Tâche').toUpperCase()}`, '', '', '']);
        let taskTotal = 0;
        (task.articles || []).forEach((article: Article) => {
          const articleTotal = (article.unitPrice || 0) * (article.quantity || 0);
          taskTotal += articleTotal;
          const qtyUnit = `${article.quantity || 0} ${article.unit || ''}`.trim();
          rows.push([
            `${article.description || 'Article'}`,
            qtyUnit,
            formatMoney(article.unitPrice || 0),
            formatMoney(articleTotal)
          ]);
        });
        // Task subtotal highlighted row (marker in first cell, include task name)
        rows.push([`__TASK_SUBTOTAL__::${task.name || 'Tâche'}`, '', '', formatMoney(taskTotal)]);
        phaseTotal += taskTotal;
      });
    }
    totalGeneral += phaseTotal;

    // Compute column widths to match the requested layout
    const availableW = pageWidth - marginX * 2;
    const qtyW = 60; // narrow
    const unitPriceW = 120; // medium
    const totalW = 120; // medium
    const descW = Math.max(120, availableW - (qtyW + unitPriceW + totalW)); // wide

    autoTable(doc, {
      startY: latestFinalY + 8,
      head: [['Description', 'Qté', 'Prix unitaire', 'Total']],
      body: rows,
      styles: {
        font: 'helvetica',
        fontSize: 10,
        cellPadding: 8,
        lineColor: toColor(colors.slate[200]),
        lineWidth: 0.5
      },
      headStyles: {
        fillColor: toColor(colors.primary),
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 11
      },
      // Set table margins explicitly and column widths
      margin: { left: marginX, right: marginX },
      tableWidth: availableW,
      columnStyles: {
        0: { cellWidth: descW },
        1: { cellWidth: qtyW, halign: 'center' },
        2: { cellWidth: unitPriceW, halign: 'right' },
        3: { cellWidth: totalW, halign: 'right' }
      },
      theme: 'grid',
      didParseCell: (data) => {
        const raw = data.row.raw as unknown as string[] | undefined;
        const firstColText = String(raw?.[0] ?? '');
        // 1) Task subtotal highlighted row (handle BEFORE uppercase task header)
        if (firstColText.startsWith('__TASK_SUBTOTAL__')) {
          const parts = firstColText.split('::');
          const taskName = (parts[1] || 'tâche').trim();
          if (data.column.index === 0) {
            data.cell.text = [`Sous-total: ${taskName}`];
            data.cell.styles.halign = 'left';
          } else if (data.column.index === 1 || data.column.index === 2) {
            data.cell.text = [''];
          } else if (data.column.index === 3) {
            data.cell.styles.halign = 'right';
          }
          data.cell.styles.fillColor = toColor(colors.slate[100]);
          data.cell.styles.textColor = toColor(colors.primaryDark);
          data.cell.styles.fontStyle = 'bold';
          return;
        }
        // 2) Task band header: blue text, italic, no background; other columns empty
        if (firstColText === firstColText.toUpperCase() && firstColText) {
          data.cell.styles.textColor = toColor(colors.primaryDark);
          data.cell.styles.fontStyle = 'italic';
          if (data.column.index > 0) data.cell.text = [''];
          return;
        }
        // 3) Regular body zebra
        if (data.section === 'body') {
          if (data.row.index % 2 === 1) {
            data.cell.styles.fillColor = toColor(colors.slate[50]);
          }
        }
      },
      didDrawPage: (data) => {
        // Footer with dynamic company address and meta info
        const pageWidth2 = data.doc.internal.pageSize.getWidth();
        const pageHeight2 = data.doc.internal.pageSize.getHeight();
        const margin = 40;
        // Build meta info: Réf | Date | Validité
        const parts: string[] = [];
        const today = new Date().toLocaleDateString('fr-FR');
        if (quote.id) {
          const idStr = String(quote.id);
          const shortId = idStr.length > 20 ? `${idStr.slice(0, 10)}…${idStr.slice(-6)}` : idStr;
          parts.push(`Réf: ${shortId}`);
        }
        parts.push(`Date: ${today}`);
        if (quote.validityDays) parts.push(`Validité: ${quote.validityDays} jours`);
        const infoText = parts.join('  |  ');
        data.doc.setFont('helvetica', 'normal');
        data.doc.setFontSize(9);
        data.doc.setTextColor(colors.slate[600][0], colors.slate[600][1], colors.slate[600][2]);
        // Meta info centered above the very bottom line
        data.doc.text(infoText, pageWidth2 / 2, pageHeight2 - 36, { align: 'center' });
        // Bottom line: dynamic company address (left) and page numbers (right)
        data.doc.setTextColor(colors.slate[500][0], colors.slate[500][1], colors.slate[500][2]);
        if (companyAddress) {
          data.doc.text(String(companyAddress), margin, pageHeight2 - 20);
        }
        data.doc.text(`${data.pageNumber} / ${data.doc.getNumberOfPages()}`, pageWidth2 - margin, pageHeight2 - 20, { align: 'right' });
      }
    });

    // After table, emphasized phase subtotal box (highlighted)
    type AutoTableCapableLocal = jsPDF & { lastAutoTable?: { finalY: number } };
    const tableFinal = (doc as AutoTableCapableLocal).lastAutoTable?.finalY || latestFinalY;
    // Place elements BELOW the table to avoid overlap
    const gap = 20;
    const phaseBoxH = 20;
    const phaseBoxW = 260;
    const phaseBoxY = tableFinal + gap;
    const phaseBoxX = pageWidth - marginX - phaseBoxW;
    // Optional hairline just above the box for separation
    doc.setDrawColor(colors.slate[200][0], colors.slate[200][1], colors.slate[200][2]);
    doc.setLineWidth(0.5);
    doc.line(marginX, tableFinal + 6, pageWidth - marginX, tableFinal + 6);
    doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFillColor(colors.slate[100][0], colors.slate[100][1], colors.slate[100][2]);
    // Harmonized stroke weight
    doc.setLineWidth(0.75);
    doc.roundedRect(phaseBoxX, phaseBoxY, phaseBoxW, phaseBoxH, 6, 6, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(colors.slate[700][0], colors.slate[700][1], colors.slate[700][2]);
    doc.text('Sous-total phase:', phaseBoxX + 10, phaseBoxY + 14);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text(formatMoney(phaseTotal), phaseBoxX + phaseBoxW - 10, phaseBoxY + 14, { align: 'right' });
    latestFinalY = phaseBoxY + phaseBoxH + 10;
  });

  // Position after last phase table and any subsequent drawn elements
  type AutoTableCapable = jsPDF & { lastAutoTable?: { finalY: number } };
  const lastY = (doc as AutoTableCapable).lastAutoTable?.finalY ?? 0;
  const tableEnd = Math.max(lastY, latestFinalY);
  // Sous-total HT boxed section
  const subTotal = totalGeneral;
  const boxY = tableEnd + 24;
  const boxW = 250;
  const boxH = 24;
  doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  // Harmonized stroke weight and light fill to match phase box
  doc.setLineWidth(0.75);
  doc.setFillColor(colors.slate[100][0], colors.slate[100][1], colors.slate[100][2]);
  doc.roundedRect(marginX, boxY, boxW, boxH, 6, 6, 'FD');
  doc.roundedRect(pageWidth - marginX - 180, boxY, 180, boxH, 6, 6, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(colors.slate[700][0], colors.slate[700][1], colors.slate[700][2]);
  doc.text('Sous-total HT', marginX + 10, boxY + 16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text(formatMoney(subTotal), pageWidth - marginX - 10, boxY + 16, { align: 'right' });
  
  // Save
  const safeTitle = (quote.title || 'devis').replace(/[^a-z0-9\-_]+/gi, '_');
  doc.save(`${safeTitle}.pdf`);
};
