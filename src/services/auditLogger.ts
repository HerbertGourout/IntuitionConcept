import { collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { UserRole } from '../config/permissions';

export interface AuditEvent {
  userId: string;
  userRole: UserRole;
  action: string;
  resource?: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  result: 'success' | 'failure' | 'blocked';
  reason?: string;
  timestamp: Timestamp;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityAlert {
  type: 'suspicious_activity' | 'permission_escalation' | 'multiple_failures' | 'unusual_access';
  userId: string;
  description: string;
  events: AuditEvent[];
  timestamp: Timestamp;
  resolved: boolean;
}

class AuditLogger {
  private readonly COLLECTION_NAME = 'audit_logs';
  private readonly ALERTS_COLLECTION = 'security_alerts';
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  /**
   * Enregistre un événement d'audit
   */
  async logEvent(event: Omit<AuditEvent, 'timestamp' | 'sessionId' | 'ipAddress' | 'userAgent'>): Promise<void> {
    try {
      const fullEvent: AuditEvent = {
        ...event,
        timestamp: Timestamp.now(),
        sessionId: this.sessionId,
        ipAddress: await this.getClientIP(),
        userAgent: navigator.userAgent
      };

      await addDoc(collection(db, this.COLLECTION_NAME), fullEvent);

      // Vérifier si cet événement déclenche une alerte de sécurité
      await this.checkForSecurityAlerts(fullEvent);

    } catch (error) {
      console.error('Erreur lors de l\'enregistrement d\'audit:', error);
      // Ne pas bloquer l'action si le logging échoue
    }
  }

  /**
   * Enregistre une action de connexion
   */
  async logLogin(userId: string, userRole: UserRole, success: boolean, reason?: string): Promise<void> {
    await this.logEvent({
      userId,
      userRole,
      action: 'login',
      result: success ? 'success' : 'failure',
      reason,
      severity: success ? 'low' : 'medium'
    });
  }

  /**
   * Enregistre une action de déconnexion
   */
  async logLogout(userId: string, userRole: UserRole): Promise<void> {
    await this.logEvent({
      userId,
      userRole,
      action: 'logout',
      result: 'success',
      severity: 'low'
    });
  }

  /**
   * Enregistre une tentative d'accès à une ressource
   */
  async logResourceAccess(
    userId: string,
    userRole: UserRole,
    resource: string,
    resourceId: string,
    action: string,
    allowed: boolean,
    reason?: string
  ): Promise<void> {
    await this.logEvent({
      userId,
      userRole,
      action: `${action}_${resource}`,
      resource,
      resourceId,
      result: allowed ? 'success' : 'blocked',
      reason,
      severity: allowed ? 'low' : 'medium'
    });
  }

  /**
   * Enregistre une action sensible (création, modification, suppression)
   */
  async logSensitiveAction(
    userId: string,
    userRole: UserRole,
    action: string,
    resource: string,
    resourceId: string,
    details?: Record<string, unknown>,
    success: boolean = true
  ): Promise<void> {
    await this.logEvent({
      userId,
      userRole,
      action,
      resource,
      resourceId,
      details,
      result: success ? 'success' : 'failure',
      severity: this.getSeverityForAction(action)
    });
  }

  /**
   * Récupère les logs d'audit pour un utilisateur
   */
  async getUserAuditLogs(userId: string, limitCount: number = 50): Promise<AuditEvent[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id
        } as unknown as AuditEvent;
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des logs:', error);
      return [];
    }
  }

  /**
   * Récupère les alertes de sécurité non résolues
   */
  async getSecurityAlerts(): Promise<SecurityAlert[]> {
    try {
      const q = query(
        collection(db, this.ALERTS_COLLECTION),
        where('resolved', '==', false),
        orderBy('timestamp', 'desc'),
        limit(20)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id
        } as unknown as SecurityAlert;
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes:', error);
      return [];
    }
  }

  /**
   * Vérifie et crée des alertes de sécurité basées sur les patterns suspects
   */
  private async checkForSecurityAlerts(event: AuditEvent): Promise<void> {
    // Vérifier les échecs de connexion multiples
    if (event.action === 'login' && event.result === 'failure') {
      await this.checkMultipleFailures(event.userId);
    }

    // Vérifier les accès inhabituels
    if (event.result === 'blocked' && event.severity === 'high') {
      await this.checkUnusualAccess(event);
    }

    // Vérifier les tentatives d'escalade de privilèges
    if (event.action.includes('admin') || event.action.includes('delete')) {
      await this.checkPermissionEscalation(event);
    }
  }

  /**
   * Vérifie les échecs de connexion multiples
   */
  private async checkMultipleFailures(userId: string): Promise<void> {
    const recentFailures = await this.getRecentEvents(userId, 'login', 'failure', 5);
    
    if (recentFailures.length >= 3) {
      await this.createSecurityAlert({
        type: 'multiple_failures',
        userId,
        description: `${recentFailures.length} tentatives de connexion échouées en 5 minutes`,
        events: recentFailures,
        timestamp: Timestamp.now(),
        resolved: false
      });
    }
  }

  /**
   * Vérifie les accès inhabituels
   */
  private async checkUnusualAccess(event: AuditEvent): Promise<void> {
    if (event.severity === 'high') {
      await this.createSecurityAlert({
        type: 'unusual_access',
        userId: event.userId,
        description: `Tentative d'accès bloquée à ${event.resource}`,
        events: [event],
        timestamp: Timestamp.now(),
        resolved: false
      });
    }
  }

  /**
   * Vérifie les tentatives d'escalade de privilèges
   */
  private async checkPermissionEscalation(event: AuditEvent): Promise<void> {
    if (event.result === 'blocked' && (event.userRole === 'worker' || event.userRole === 'client')) {
      await this.createSecurityAlert({
        type: 'permission_escalation',
        userId: event.userId,
        description: `Tentative d'action privilégiée par ${event.userRole}`,
        events: [event],
        timestamp: Timestamp.now(),
        resolved: false
      });
    }
  }

  /**
   * Récupère les événements récents pour un utilisateur
   */
  private async getRecentEvents(
    userId: string,
    action: string,
    result: string,
    minutesBack: number
  ): Promise<AuditEvent[]> {
    const cutoff = new Date(Date.now() - minutesBack * 60 * 1000);
    
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        where('action', '==', action),
        where('result', '==', result),
        where('timestamp', '>=', Timestamp.fromDate(cutoff)),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as AuditEvent);
    } catch (error) {
      console.error('Erreur lors de la récupération des événements récents:', error);
      return [];
    }
  }

  /**
   * Crée une alerte de sécurité
   */
  private async createSecurityAlert(alert: SecurityAlert): Promise<void> {
    try {
      await addDoc(collection(db, this.ALERTS_COLLECTION), alert);
      console.warn(`[SECURITY ALERT] ${alert.type}: ${alert.description}`);
    } catch (error) {
      console.error('Erreur lors de la création d\'alerte de sécurité:', error);
    }
  }

  /**
   * Détermine la sévérité d'une action
   */
  private getSeverityForAction(action: string): 'low' | 'medium' | 'high' | 'critical' {
    if (action.includes('delete') || action.includes('admin')) return 'high';
    if (action.includes('create') || action.includes('edit')) return 'medium';
    return 'low';
  }

  /**
   * Récupère l'IP du client
   */
  private async getClientIP(): Promise<string | undefined> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return undefined;
    }
  }

  /**
   * Génère un ID de session unique
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const auditLogger = new AuditLogger();
export default auditLogger;
