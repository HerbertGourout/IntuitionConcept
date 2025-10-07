import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Project } from '../contexts/projectTypes';

// Extension du type jsPDF pour inclure autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: {
      startY?: number;
      head?: string[][];
      body?: (string | number)[][];
      theme?: string;
      headStyles?: { fillColor: number[] };
      styles?: { fontSize: number };
      columnStyles?: Record<number, { cellWidth: number }>;
    }) => jsPDF;
  }
}

interface ReportData {
  id: string;
  name: string;
  type: string;
  progress: number;
  budget: number;
  spent: number;
  tasks: number;
  completedTasks: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'delayed' | 'on_hold';
}

interface ReportStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  totalSpent: number;
  totalTasks: number;
  completedTasks: number;
  averageProgress: number;
}

export class ReportService {
  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('XOF', 'FCFA');
  }

  private static formatDate(dateString: string): string {
    if (!dateString) return 'Non défini';
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  private static getStatusText(status: string): string {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'active': return 'En cours';
      case 'delayed': return 'En retard';
      case 'on_hold': return 'En pause';
      default: return 'Inconnu';
    }
  }

  private static addHeader(doc: jsPDF, title: string): void {
    // Logo/En-tête
    doc.setFillColor(79, 70, 229); // Indigo
    doc.rect(0, 0, 210, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('IntuitionConcept', 20, 20);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(title, 20, 25);
    
    // Date de génération
    doc.setFontSize(10);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 140, 25);
    
    doc.setTextColor(0, 0, 0);
  }

  private static addFooter(doc: jsPDF): void {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Page ${i} sur ${pageCount}`, 180, 290);
      doc.text('IntuitionConcept - Gestion de Projets BTP', 20, 290);
    }
  }

  static generateGlobalReport(projects: Project[]): void {
    const doc = new jsPDF();
    
    // Calcul des données
    const reportData: ReportData[] = projects.map(project => {
      const totalTasks = project.phases?.reduce((acc, phase) => acc + (phase.tasks?.length || 0), 0) || 0;
      const completedTasks = project.phases?.reduce((acc, phase) => 
        acc + (phase.tasks?.filter(task => task.status === 'done').length || 0), 0) || 0;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      let status: ReportData['status'] = 'active';
      if (progress === 100) status = 'completed';
      else if (progress < 30) status = 'delayed';
      else if (project.status === 'on_hold') status = 'on_hold';

      return {
        id: project.id,
        name: project.name,
        type: project.type || 'Construction',
        progress,
        budget: project.budget,
        spent: project.spent || 0,
        tasks: totalTasks,
        completedTasks,
        startDate: project.startDate,
        endDate: project.endDate,
        status
      };
    });

    const stats: ReportStats = {
      totalProjects: reportData.length,
      activeProjects: reportData.filter(p => p.status === 'active').length,
      completedProjects: reportData.filter(p => p.status === 'completed').length,
      totalBudget: reportData.reduce((sum, p) => sum + p.budget, 0),
      totalSpent: reportData.reduce((sum, p) => sum + p.spent, 0),
      totalTasks: reportData.reduce((sum, p) => sum + p.tasks, 0),
      completedTasks: reportData.reduce((sum, p) => sum + p.completedTasks, 0),
      averageProgress: reportData.length > 0 ? Math.round(reportData.reduce((sum, p) => sum + p.progress, 0) / reportData.length) : 0
    };

    this.addHeader(doc, 'Rapport Global des Projets');

    // Statistiques générales
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Statistiques Générales', 20, 50);

    const statsData = [
      ['Total des projets', stats.totalProjects.toString()],
      ['Projets actifs', stats.activeProjects.toString()],
      ['Projets terminés', stats.completedProjects.toString()],
      ['Budget total', this.formatCurrency(stats.totalBudget)],
      ['Montant dépensé', this.formatCurrency(stats.totalSpent)],
      ['Budget restant', this.formatCurrency(stats.totalBudget - stats.totalSpent)],
      ['Total des tâches', stats.totalTasks.toString()],
      ['Tâches terminées', stats.completedTasks.toString()],
      ['Progression moyenne', `${stats.averageProgress}%`]
    ];

    doc.autoTable({
      startY: 60,
      head: [['Métrique', 'Valeur']],
      body: statsData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 10 }
    });

    // Liste détaillée des projets
    doc.addPage();
    this.addHeader(doc, 'Rapport Global des Projets');
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Détail des Projets', 20, 50);

    const projectsTableData = reportData.map(project => [
      project.name,
      project.type,
      this.getStatusText(project.status),
      `${project.progress}%`,
      this.formatCurrency(project.budget),
      this.formatCurrency(project.spent),
      `${project.completedTasks}/${project.tasks}`,
      this.formatDate(project.startDate),
      this.formatDate(project.endDate)
    ]);

    doc.autoTable({
      startY: 60,
      head: [['Projet', 'Type', 'Statut', 'Progression', 'Budget', 'Dépensé', 'Tâches', 'Début', 'Fin']],
      body: projectsTableData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 20 },
        2: { cellWidth: 18 },
        3: { cellWidth: 15 },
        4: { cellWidth: 22 },
        5: { cellWidth: 22 },
        6: { cellWidth: 15 },
        7: { cellWidth: 18 },
        8: { cellWidth: 18 }
      }
    });

    this.addFooter(doc);
    doc.save(`rapport-global-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  static generateProjectReport(project: Project): void {
    const doc = new jsPDF();
    
    this.addHeader(doc, `Rapport de Projet - ${project.name}`);

    // Informations générales du projet
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Informations Générales', 20, 50);

    const projectInfo = [
      ['Nom du projet', project.name],
      ['Type', project.type || 'Non défini'],
      ['Client', project.client || 'Non défini'],
      ['Statut', this.getStatusText(project.status)],
      ['Date de début', this.formatDate(project.startDate)],
      ['Date de fin', this.formatDate(project.endDate)],
      ['Budget total', this.formatCurrency(project.budget)],
      ['Montant dépensé', this.formatCurrency(project.spent || 0)],
      ['Budget restant', this.formatCurrency(project.budget - (project.spent || 0))],
      ['Description', project.description || 'Aucune description']
    ];

    doc.autoTable({
      startY: 60,
      head: [['Propriété', 'Valeur']],
      body: projectInfo,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 120 }
      }
    });

    // Phases du projet
    if (project.phases && project.phases.length > 0) {
      doc.addPage();
      this.addHeader(doc, `Rapport de Projet - ${project.name}`);
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Phases du Projet', 20, 50);

      const phasesData = project.phases.map(phase => {
        const totalTasks = phase.tasks?.length || 0;
        const completedTasks = phase.tasks?.filter(task => task.status === 'done').length || 0;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const spent = phase.tasks?.reduce((sum, task) => sum + (task.spent || 0), 0) || 0;

        return [
          phase.name,
          this.getStatusText(phase.status || 'active'),
          `${progress}%`,
          this.formatCurrency(phase.estimatedBudget || 0),
          this.formatCurrency(spent),
          `${completedTasks}/${totalTasks}`,
          this.formatDate(phase.startDate || ''),
          this.formatDate(phase.endDate || '')
        ];
      });

      doc.autoTable({
        startY: 60,
        head: [['Phase', 'Statut', 'Progression', 'Budget', 'Dépensé', 'Tâches', 'Début', 'Fin']],
        body: phasesData,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 20 },
          2: { cellWidth: 18 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 20 },
          6: { cellWidth: 20 },
          7: { cellWidth: 20 }
        }
      });

      // Détail des tâches par phase
      project.phases.forEach((phase) => {
        if (phase.tasks && phase.tasks.length > 0) {
          doc.addPage();
          this.addHeader(doc, `Rapport de Projet - ${project.name}`);
          
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text(`Tâches de la Phase: ${phase.name}`, 20, 50);

          const tasksData = phase.tasks.map(task => [
            task.name,
            this.getStatusText(task.status),
            task.priority || 'Medium',
            this.formatCurrency(task.budget || 0),
            this.formatCurrency(task.spent || 0),
            this.formatDate(task.startDate || ''),
            this.formatDate(task.dueDate || task.endDate || ''),
            task.assignedTo?.join(', ') || 'Non assigné'
          ]);

          doc.autoTable({
            startY: 60,
            head: [['Tâche', 'Statut', 'Priorité', 'Budget', 'Dépensé', 'Début', 'Échéance', 'Assigné à']],
            body: tasksData,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] },
            styles: { fontSize: 8 },
            columnStyles: {
              0: { cellWidth: 25 },
              1: { cellWidth: 18 },
              2: { cellWidth: 15 },
              3: { cellWidth: 20 },
              4: { cellWidth: 20 },
              5: { cellWidth: 18 },
              6: { cellWidth: 18 },
              7: { cellWidth: 25 }
            }
          });
        }
      });
    }

    this.addFooter(doc);
    doc.save(`rapport-projet-${project.name.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  static generateFinancialReport(projects: Project[]): void {
    const doc = new jsPDF();
    
    this.addHeader(doc, 'Rapport Financier Détaillé');

    // Analyse financière globale
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Analyse Financière Globale', 20, 50);

    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const totalSpent = projects.reduce((sum, p) => sum + (p.spent || 0), 0);
    const budgetUtilization = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : '0';

    const financialData = [
      ['Budget total alloué', this.formatCurrency(totalBudget)],
      ['Montant total dépensé', this.formatCurrency(totalSpent)],
      ['Budget restant', this.formatCurrency(totalBudget - totalSpent)],
      ['Taux d\'utilisation du budget', `${budgetUtilization}%`],
      ['Économies réalisées', this.formatCurrency(Math.max(0, totalBudget - totalSpent))],
      ['Dépassements', this.formatCurrency(Math.max(0, totalSpent - totalBudget))]
    ];

    doc.autoTable({
      startY: 60,
      head: [['Métrique Financière', 'Valeur']],
      body: financialData,
      theme: 'grid',
      headStyles: { fillColor: [34, 197, 94] },
      styles: { fontSize: 11 }
    });

    // Analyse par projet
    doc.addPage();
    this.addHeader(doc, 'Rapport Financier Détaillé');
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Analyse Financière par Projet', 20, 50);

    const projectFinancialData = projects.map(project => {
      const spent = project.spent || 0;
      const remaining = project.budget - spent;
      const utilization = project.budget > 0 ? ((spent / project.budget) * 100).toFixed(1) : '0';
      const status = spent > project.budget ? 'Dépassement' : remaining < project.budget * 0.1 ? 'Attention' : 'Normal';

      return [
        project.name,
        this.formatCurrency(project.budget),
        this.formatCurrency(spent),
        this.formatCurrency(remaining),
        `${utilization}%`,
        status
      ];
    });

    doc.autoTable({
      startY: 60,
      head: [['Projet', 'Budget', 'Dépensé', 'Restant', 'Utilisation', 'Statut']],
      body: projectFinancialData,
      theme: 'grid',
      headStyles: { fillColor: [34, 197, 94] },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 28 },
        2: { cellWidth: 28 },
        3: { cellWidth: 28 },
        4: { cellWidth: 20 },
        5: { cellWidth: 25 }
      }
    });

    // Recommandations
    doc.addPage();
    this.addHeader(doc, 'Rapport Financier Détaillé');
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Recommandations Financières', 20, 50);

    const recommendations = [
      'Surveiller de près les projets avec un taux d\'utilisation > 90%',
      'Réviser les budgets des projets en dépassement',
      'Optimiser l\'allocation des ressources sur les projets sous-utilisés',
      'Mettre en place des alertes automatiques à 80% d\'utilisation',
      'Analyser les causes des dépassements budgétaires',
      'Considérer une réallocation des budgets entre projets'
    ];

    let yPosition = 70;
    recommendations.forEach((rec, index) => {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`${index + 1}. ${rec}`, 25, yPosition);
      yPosition += 15;
    });

    this.addFooter(doc);
    doc.save(`rapport-financier-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  static generatePerformanceReport(projects: Project[]): void {
    const doc = new jsPDF();
    
    this.addHeader(doc, 'Analyse de Performance');

    // Métriques de performance
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Métriques de Performance Globales', 20, 50);

    const totalTasks = projects.reduce((sum, p) => 
      sum + (p.phases?.reduce((acc, phase) => acc + (phase.tasks?.length || 0), 0) || 0), 0);
    const completedTasks = projects.reduce((sum, p) => 
      sum + (p.phases?.reduce((acc, phase) => 
        acc + (phase.tasks?.filter(task => task.status === 'done').length || 0), 0) || 0), 0);
    const inProgressTasks = projects.reduce((sum, p) => 
      sum + (p.phases?.reduce((acc, phase) => 
        acc + (phase.tasks?.filter(task => task.status === 'in_progress').length || 0), 0) || 0), 0);
    
    const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : '0';
    const activeProjectsCount = projects.filter(p => p.status === 'active').length;
    const completedProjectsCount = projects.filter(p => p.status === 'completed').length;

    const performanceData = [
      ['Taux de completion des tâches', `${completionRate}%`],
      ['Tâches terminées', completedTasks.toString()],
      ['Tâches en cours', inProgressTasks.toString()],
      ['Tâches restantes', (totalTasks - completedTasks).toString()],
      ['Projets actifs', activeProjectsCount.toString()],
      ['Projets terminés', completedProjectsCount.toString()]
    ];

    doc.autoTable({
      startY: 60,
      head: [['Métrique de Performance', 'Valeur']],
      body: performanceData,
      theme: 'grid',
      headStyles: { fillColor: [147, 51, 234] },
      styles: { fontSize: 11 }
    });

    // Performance par projet
    doc.addPage();
    this.addHeader(doc, 'Analyse de Performance');
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Performance par Projet', 20, 50);

    const projectPerformanceData = projects.map(project => {
      const projectTotalTasks = project.phases?.reduce((acc, phase) => acc + (phase.tasks?.length || 0), 0) || 0;
      const projectCompletedTasks = project.phases?.reduce((acc, phase) => 
        acc + (phase.tasks?.filter(task => task.status === 'done').length || 0), 0) || 0;
      const projectProgress = projectTotalTasks > 0 ? Math.round((projectCompletedTasks / projectTotalTasks) * 100) : 0;
      
      return [
        project.name,
        `${projectProgress}%`,
        `${projectCompletedTasks}/${projectTotalTasks}`,
        this.getStatusText(project.status)
      ];
    });

    doc.autoTable({
      startY: 60,
      head: [['Projet', 'Progression', 'Tâches', 'Statut']],
      body: projectPerformanceData,
      theme: 'grid',
      headStyles: { fillColor: [147, 51, 234] },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 30 }
      }
    });

    this.addFooter(doc);
    doc.save(`rapport-performance-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  static exportToExcel(projects: Project[], filename: string = 'export-projets'): void {
    // Création des données pour l'export CSV (simulant Excel)
    const csvData = projects.map(project => {
      const totalTasks = project.phases?.reduce((acc, phase) => acc + (phase.tasks?.length || 0), 0) || 0;
      const completedTasks = project.phases?.reduce((acc, phase) => 
        acc + (phase.tasks?.filter(task => task.status === 'done').length || 0), 0) || 0;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        'Nom du Projet': project.name,
        'Type': project.type || 'Non défini',
        'Client': project.client || 'Non défini',
        'Statut': this.getStatusText(project.status),
        'Date de Début': this.formatDate(project.startDate),
        'Date de Fin': this.formatDate(project.endDate),
        'Budget': project.budget,
        'Dépensé': project.spent || 0,
        'Budget Restant': project.budget - (project.spent || 0),
        'Total Tâches': totalTasks,
        'Tâches Terminées': completedTasks,
        'Progression (%)': progress,
        'Description': project.description || 'Aucune description'
      };
    });

    // Conversion en CSV
    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    // Téléchargement
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export default ReportService;
