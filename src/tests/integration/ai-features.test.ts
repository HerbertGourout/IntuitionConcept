

import { describe, it, expect, beforeEach } from 'vitest';
import { projectPlanGenerator } from '../../services/ai/projectPlanGenerator';
import { initializeSiteReportGenerator } from '../../services/ai/siteReportGenerator';
import { pdfExportService } from '../../services/pdfExportService';

describe('AI Features Integration Tests', () => {
  
  describe('Project Plan Generator', () => {
    it('should generate a valid project plan from prompt', async () => {
      const prompt = 'Construction d\'une villa R+1 de 150m² à Brazzaville';
      
      const plan = await projectPlanGenerator.generatePlanFromPrompt(prompt);
      
      expect(plan).toBeDefined();
      expect(plan.phases).toBeDefined();
      expect(plan.phases.length).toBeGreaterThan(0);
      
      // Vérifier la structure des phases
      plan.phases.forEach(phase => {
        expect(phase.name).toBeDefined();
        expect(phase.duration).toBeDefined();
        expect(phase.subTasks).toBeDefined();
        expect(Array.isArray(phase.subTasks)).toBe(true);
        
        // Vérifier la structure des tâches
        phase.subTasks.forEach(task => {
          expect(task.name).toBeDefined();
          expect(task.tradeSkill).toBeDefined();
          expect(task.duration).toBeDefined();
          expect(task.materials).toBeDefined();
          expect(Array.isArray(task.materials)).toBe(true);
        });
      });
    });
    
    it('should include detailed materials for each task', async () => {
      const prompt = 'Construction villa 100m²';
      const plan = await projectPlanGenerator.generatePlanFromPrompt(prompt);
      
      let totalMaterials = 0;
      plan.phases.forEach(phase => {
        phase.subTasks.forEach(task => {
          totalMaterials += task.materials.length;
          
          task.materials.forEach(material => {
            expect(material.name).toBeDefined();
            expect(material.quantity).toBeDefined();
            expect(material.unit).toBeDefined();
          });
        });
      });
      
      expect(totalMaterials).toBeGreaterThan(0);
    });
  });
  
  describe('Site Report Generator', () => {
    let reportGenerator: ReturnType<typeof initializeSiteReportGenerator>;
    
    beforeEach(() => {
      reportGenerator = initializeSiteReportGenerator();
    });
    
    it('should generate a complete site report', async () => {
      const reportData = {
        projectId: 'test-project-1',
        projectName: 'Villa Test',
        projectAddress: 'Brazzaville',
        reportDate: new Date().toISOString(),
        reportType: 'daily' as const,
        overallProgress: 65,
        phaseProgress: [
          { phaseName: 'Fondations', progress: 100, status: 'completed' as const },
          { phaseName: 'Structure', progress: 50, status: 'in_progress' as const }
        ],
        teamPresence: {
          totalWorkers: 10,
          present: 8,
          absent: 2,
          absentees: []
        },
        completedTasks: [
          {
            taskName: 'Coulage dalle',
            description: 'Dalle RDC terminée',
            progress: 100,
            assignedTo: 'Équipe A',
            photos: []
          }
        ],
        materialsUsed: [
          { materialName: 'Ciment', quantity: 15, unit: 'sacs' }
        ],
        materialsDelivered: [],
        equipmentUsed: [],
        incidents: [],
        weather: {
          condition: 'Ensoleillé',
          temperature: 28,
          impact: 'none' as const
        },
        observations: [],
        nextDayPlan: {
          plannedTasks: ['Continuer structure'],
          expectedDeliveries: [],
          requiredWorkers: 10
        },
        photos: [],
        reportedBy: {
          name: 'Chef de chantier',
          role: 'Superviseur'
        }
      };
      
      const report = await reportGenerator.generateReport(reportData);
      
      expect(report).toBeDefined();
      expect(report.reportId).toBeDefined();
      expect(report.executiveSummary).toBeDefined();
      expect(report.detailedSections).toBeDefined();
      expect(Array.isArray(report.detailedSections)).toBe(true);
      expect(report.statistics).toBeDefined();
      expect(report.recommendations).toBeDefined();
    });
    
    it('should generate quick report without AI', () => {
      const reportData = {
        projectId: 'test-project-2',
        projectName: 'Villa Quick Test',
        projectAddress: 'Pointe-Noire',
        reportDate: new Date().toISOString(),
        reportType: 'daily' as const,
        overallProgress: 45,
        phaseProgress: [],
        teamPresence: {
          totalWorkers: 5,
          present: 5,
          absent: 0,
          absentees: []
        },
        completedTasks: [],
        materialsUsed: [],
        materialsDelivered: [],
        equipmentUsed: [],
        incidents: [],
        weather: {
          condition: 'Pluvieux',
          temperature: 25,
          impact: 'minor' as const
        },
        observations: [],
        nextDayPlan: {
          plannedTasks: [],
          expectedDeliveries: [],
          requiredWorkers: 5
        },
        photos: [],
        reportedBy: {
          name: 'Test User',
          role: 'Chef'
        }
      };
      
      const report = reportGenerator.generateQuickReport(reportData);
      
      expect(report).toBeDefined();
      expect(report.reportId).toBeDefined();
      expect(report.executiveSummary).toContain('Villa Quick Test');
    });
  });
  
  describe('PDF Export Service', () => {
    it('should export site report to PDF blob', async () => {
      const reportGenerator = initializeSiteReportGenerator();
      
      const reportData = {
        projectId: 'pdf-test-1',
        projectName: 'PDF Test Project',
        projectAddress: 'Test Address',
        reportDate: new Date().toISOString(),
        reportType: 'daily' as const,
        overallProgress: 50,
        phaseProgress: [],
        teamPresence: {
          totalWorkers: 10,
          present: 10,
          absent: 0,
          absentees: []
        },
        completedTasks: [],
        materialsUsed: [],
        materialsDelivered: [],
        equipmentUsed: [],
        incidents: [],
        weather: {
          condition: 'Ensoleillé',
          temperature: 30,
          impact: 'none' as const
        },
        observations: [],
        nextDayPlan: {
          plannedTasks: [],
          expectedDeliveries: [],
          requiredWorkers: 10
        },
        photos: [],
        reportedBy: {
          name: 'Test',
          role: 'Test'
        }
      };
      
      const report = reportGenerator.generateQuickReport(reportData);
      
      const pdfBlob = pdfExportService.exportSiteReport(report, {
        title: 'Test Report',
        subtitle: 'Test Subtitle',
        author: 'Test Author'
      });
      
      expect(pdfBlob).toBeDefined();
      expect(pdfBlob instanceof Blob).toBe(true);
      expect(pdfBlob.type).toBe('application/pdf');
      expect(pdfBlob.size).toBeGreaterThan(0);
    });
    
    it('should export project plan to PDF blob', async () => {
      const plan = await projectPlanGenerator.generatePlanFromPrompt('Test project');
      
      const pdfBlob = pdfExportService.exportProjectPlan(plan, {
        title: 'Test Plan',
        subtitle: 'Test Subtitle',
        author: 'Test Author'
      });
      
      expect(pdfBlob).toBeDefined();
      expect(pdfBlob instanceof Blob).toBe(true);
      expect(pdfBlob.type).toBe('application/pdf');
      expect(pdfBlob.size).toBeGreaterThan(0);
    });
  });
  
  describe('End-to-End Workflow', () => {
    it('should complete full workflow: generate plan -> export PDF', async () => {
      // 1. Générer un plan
      const plan = await projectPlanGenerator.generatePlanFromPrompt(
        'Construction villa 120m² avec 3 chambres'
      );
      
      expect(plan).toBeDefined();
      expect(plan.phases.length).toBeGreaterThan(0);
      
      // 2. Exporter en PDF
      const pdfBlob = pdfExportService.exportProjectPlan(plan, {
        title: 'Plan Complet',
        author: 'Test System'
      });
      
      expect(pdfBlob).toBeDefined();
      expect(pdfBlob.size).toBeGreaterThan(1000); // Au moins 1KB
    });
    
    it('should complete full workflow: generate report -> export PDF', async () => {
      const reportGenerator = initializeSiteReportGenerator();
      
      // 1. Générer un rapport
      const reportData = {
        projectId: 'workflow-test',
        projectName: 'Workflow Test Project',
        projectAddress: 'Test City',
        reportDate: new Date().toISOString(),
        reportType: 'weekly' as const,
        overallProgress: 75,
        phaseProgress: [
          { phaseName: 'Phase 1', progress: 100, status: 'completed' as const },
          { phaseName: 'Phase 2', progress: 50, status: 'in_progress' as const }
        ],
        teamPresence: {
          totalWorkers: 15,
          present: 14,
          absent: 1,
          absentees: [{ name: 'Worker 1', role: 'Maçon', reason: 'Maladie' }]
        },
        completedTasks: [
          {
            taskName: 'Task 1',
            description: 'Completed task',
            progress: 100,
            assignedTo: 'Team A',
            photos: []
          }
        ],
        materialsUsed: [
          { materialName: 'Ciment', quantity: 50, unit: 'sacs' },
          { materialName: 'Fer', quantity: 2, unit: 'tonnes' }
        ],
        materialsDelivered: [],
        equipmentUsed: [
          {
            equipmentName: 'Bétonnière',
            hoursUsed: 8,
            condition: 'good' as const
          }
        ],
        incidents: [
          {
            type: 'safety' as const,
            severity: 'low' as const,
            description: 'Minor incident',
            time: '10:00',
            actionTaken: 'Resolved'
          }
        ],
        weather: {
          condition: 'Ensoleillé',
          temperature: 32,
          impact: 'none' as const
        },
        observations: ['Good progress', 'Team motivated'],
        nextDayPlan: {
          plannedTasks: ['Continue phase 2', 'Start phase 3 prep'],
          expectedDeliveries: ['Carrelage'],
          requiredWorkers: 15
        },
        photos: [],
        reportedBy: {
          name: 'Site Manager',
          role: 'Manager'
        }
      };
      
      const report = reportGenerator.generateQuickReport(reportData);
      
      expect(report).toBeDefined();
      
      // 2. Exporter en PDF
      const pdfBlob = pdfExportService.exportSiteReport(report, {
        title: 'Rapport Hebdomadaire',
        subtitle: 'Workflow Test Project',
        author: 'Site Manager'
      });
      
      expect(pdfBlob).toBeDefined();
      expect(pdfBlob.size).toBeGreaterThan(1000);
    });
  });
});
