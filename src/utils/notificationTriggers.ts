import { NotificationService } from '../services/NotificationService';

// Utility functions to automatically create notifications for platform events

export class NotificationTriggers {
  // Project-related notifications
  static async onProjectCreated(userId: string, projectId: string, projectName: string) {
    await NotificationService.createProjectNotification(
      userId,
      projectId,
      'Nouveau projet créé',
      `Le projet "${projectName}" a été créé avec succès. Vous pouvez maintenant commencer à ajouter des tâches et des phases.`,
      'success',
      'medium'
    );
  }

  static async onProjectCompleted(userId: string, projectId: string, projectName: string) {
    await NotificationService.createProjectNotification(
      userId,
      projectId,
      'Projet terminé',
      `Félicitations ! Le projet "${projectName}" a été marqué comme terminé.`,
      'success',
      'high'
    );
  }

  static async onProjectBudgetExceeded(userId: string, projectId: string, projectName: string, budgetAmount: number, spentAmount: number) {
    const percentage = Math.round((spentAmount / budgetAmount) * 100);
    await NotificationService.createProjectNotification(
      userId,
      projectId,
      'Budget dépassé',
      `Le projet "${projectName}" a dépassé son budget de ${percentage}%. Budget: ${budgetAmount} FCFA, Dépensé: ${spentAmount} FCFA.`,
      'warning',
      'high'
    );
  }

  static async onTaskOverdue(userId: string, projectId: string, taskName: string) {
    await NotificationService.createProjectNotification(
      userId,
      projectId,
      'Tâche en retard',
      `La tâche "${taskName}" est en retard. Veuillez vérifier les délais et mettre à jour le statut.`,
      'warning',
      'high'
    );
  }

  // Payment-related notifications
  static async onPaymentSuccess(userId: string, paymentId: string, amount: number, currency: string) {
    await NotificationService.createPaymentNotification(
      userId,
      paymentId,
      'Paiement réussi',
      `Votre paiement de ${amount} ${currency} a été traité avec succès.`,
      'success',
      'medium'
    );
  }

  static async onPaymentFailed(userId: string, paymentId: string, amount: number, currency: string, reason?: string) {
    await NotificationService.createPaymentNotification(
      userId,
      paymentId,
      'Échec du paiement',
      `Le paiement de ${amount} ${currency} a échoué. ${reason ? `Raison: ${reason}` : 'Veuillez réessayer.'}`,
      'error',
      'high'
    );
  }

  static async onPaymentPending(userId: string, paymentId: string, amount: number, currency: string) {
    await NotificationService.createPaymentNotification(
      userId,
      paymentId,
      'Paiement en attente',
      `Votre paiement de ${amount} ${currency} est en cours de traitement. Vous recevrez une confirmation sous peu.`,
      'info',
      'medium'
    );
  }

  // Equipment-related notifications
  static async onEquipmentMaintenanceDue(userId: string, equipmentId: string, equipmentName: string, dueDate: string) {
    await NotificationService.createEquipmentNotification(
      userId,
      equipmentId,
      'Maintenance requise',
      `L'équipement "${equipmentName}" nécessite une maintenance avant le ${dueDate}.`,
      'warning',
      'high'
    );
  }

  static async onEquipmentBreakdown(userId: string, equipmentId: string, equipmentName: string) {
    await NotificationService.createEquipmentNotification(
      userId,
      equipmentId,
      'Panne d\'équipement',
      `L'équipement "${equipmentName}" est en panne et nécessite une intervention immédiate.`,
      'error',
      'urgent'
    );
  }

  static async onEquipmentAdded(userId: string, equipmentId: string, equipmentName: string) {
    await NotificationService.createEquipmentNotification(
      userId,
      equipmentId,
      'Nouvel équipement ajouté',
      `L'équipement "${equipmentName}" a été ajouté à votre inventaire.`,
      'success',
      'low'
    );
  }

  // Team-related notifications
  static async onTeamMemberAdded(userId: string, memberName: string, role: string) {
    await NotificationService.createNotification({
      title: 'Nouveau membre d\'équipe',
      message: `${memberName} a rejoint l'équipe en tant que ${role}.`,
      type: 'success',
      category: 'team',
      priority: 'medium',
      userId,
      isRead: false,
      isArchived: false,
      actionUrl: '/team',
      actionLabel: 'Voir l\'équipe'
    });
  }

  static async onTeamMemberLeft(userId: string, memberName: string) {
    await NotificationService.createNotification({
      title: 'Membre d\'équipe parti',
      message: `${memberName} a quitté l'équipe.`,
      type: 'info',
      category: 'team',
      priority: 'medium',
      userId,
      isRead: false,
      isArchived: false,
      actionUrl: '/team',
      actionLabel: 'Voir l\'équipe'
    });
  }

  // Location-related notifications
  static async onLocationAdded(userId: string, locationId: string, locationName: string, locationType: string) {
    await NotificationService.createLocationNotification(
      userId,
      locationId,
      'Nouvelle localisation',
      `La ${locationType} "${locationName}" a été ajoutée à vos localisations.`,
      'success',
      'low'
    );
  }

  static async onLocationIssue(userId: string, locationId: string, locationName: string, issue: string) {
    await NotificationService.createLocationNotification(
      userId,
      locationId,
      'Problème de localisation',
      `Problème signalé pour "${locationName}": ${issue}`,
      'warning',
      'medium'
    );
  }

  // System notifications
  static async onSystemMaintenance(userId: string, maintenanceDate: string, duration: string) {
    await NotificationService.createNotification({
      title: 'Maintenance programmée',
      message: `Une maintenance système est programmée le ${maintenanceDate} pendant ${duration}. Certaines fonctionnalités pourraient être temporairement indisponibles.`,
      type: 'info',
      category: 'system',
      priority: 'medium',
      userId,
      isRead: false,
      isArchived: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Expire in 7 days
    });
  }

  static async onSystemUpdate(userId: string, version: string, features: string[]) {
    await NotificationService.createNotification({
      title: 'Nouvelle mise à jour disponible',
      message: `La version ${version} est maintenant disponible avec les nouvelles fonctionnalités: ${features.join(', ')}.`,
      type: 'success',
      category: 'system',
      priority: 'low',
      userId,
      isRead: false,
      isArchived: false,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Expire in 30 days
    });
  }

  // Batch notifications for multiple users
  static async notifyAllTeamMembers(userIds: string[], title: string, message: string, category: 'project' | 'team' | 'system' = 'team', priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium') {
    const promises = userIds.map(userId => 
      NotificationService.createNotification({
        title,
        message,
        type: 'info',
        category,
        priority,
        userId,
        isRead: false,
        isArchived: false
      })
    );
    
    await Promise.all(promises);
  }

  // Reminder notifications
  static async createReminder(userId: string, title: string, message: string, reminderDate: Date, category: 'project' | 'equipment' | 'team' | 'system' = 'system') {
    // Calculate if reminder should be sent now or scheduled
    const now = new Date();
    const timeDiff = reminderDate.getTime() - now.getTime();
    
    if (timeDiff <= 0) {
      // Send immediately
      await NotificationService.createNotification({
        title: `Rappel: ${title}`,
        message,
        type: 'info',
        category,
        priority: 'medium',
        userId,
        isRead: false,
        isArchived: false
      });
    } else {
      // Schedule for later (this would require a job scheduler in production)
      console.log(`Reminder scheduled for ${reminderDate.toISOString()}: ${title}`);
      // In a real implementation, you would use a job scheduler like node-cron or a cloud function
    }
  }
}
