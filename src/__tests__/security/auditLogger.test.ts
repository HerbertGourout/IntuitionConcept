import { auditLogger } from '../../services/auditLogger';
import { collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

// Mock Firestore
jest.mock('firebase/firestore');
jest.mock('../../firebase');

const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
const mockCollection = collection as jest.MockedFunction<typeof collection>;
const mockQuery = query as jest.MockedFunction<typeof query>;
const mockWhere = where as jest.MockedFunction<typeof where>;
const mockOrderBy = orderBy as jest.MockedFunction<typeof orderBy>;
const mockLimit = limit as jest.MockedFunction<typeof limit>;
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;

describe('AuditLogger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Firestore collection reference
    mockCollection.mockReturnValue('mock-collection' as any);
    mockQuery.mockReturnValue('mock-query' as any);
    mockAddDoc.mockResolvedValue({ id: 'mock-doc-id' } as any);
    mockGetDocs.mockResolvedValue({
      docs: []
    } as any);
  });

  describe('logSensitiveAction', () => {
    it('devrait logger une action sensible avec succès', async () => {
      await auditLogger.logSensitiveAction(
        'user-123',
        'manager',
        'delete_quote',
        'quote',
        'quote-456',
        { quoteId: 'quote-456' },
        true
      );

      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection',
        expect.objectContaining({
          userId: 'user-123',
          userRole: 'manager',
          action: 'delete_quote',
          resource: 'quote',
          resourceId: 'quote-456',
          metadata: { quoteId: 'quote-456' },
          result: 'success',
          severity: 'high',
          timestamp: expect.any(Object)
        })
      );
    });

    it('devrait logger une action échouée', async () => {
      await auditLogger.logSensitiveAction(
        'user-123',
        'worker',
        'delete_quote',
        'quote',
        'quote-456',
        { error: 'Permission denied' },
        false
      );

      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection',
        expect.objectContaining({
          result: 'failure',
          severity: 'high'
        })
      );
    });
  });

  describe('logResourceAccess', () => {
    it('devrait logger l\'accès à une ressource', async () => {
      await auditLogger.logResourceAccess(
        'user-123',
        'supervisor',
        'project',
        'project-789',
        'view_project',
        true
      );

      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection',
        expect.objectContaining({
          userId: 'user-123',
          userRole: 'supervisor',
          resource: 'project',
          resourceId: 'project-789',
          action: 'view_project',
          result: 'success',
          severity: 'low'
        })
      );
    });

    it('devrait logger un accès refusé avec message d\'erreur', async () => {
      await auditLogger.logResourceAccess(
        'user-123',
        'worker',
        'finance',
        'budget-001',
        'view_budget',
        false,
        'Insufficient permissions'
      );

      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection',
        expect.objectContaining({
          result: 'blocked',
          severity: 'medium',
          metadata: expect.objectContaining({
            errorMessage: 'Insufficient permissions'
          })
        })
      );
    });
  });

  describe('logLoginAttempt', () => {
    it('devrait logger une tentative de connexion réussie', async () => {
      await auditLogger.logLoginAttempt('user-123', 'user@example.com', true);

      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection',
        expect.objectContaining({
          userId: 'user-123',
          action: 'login',
          result: 'success',
          severity: 'low',
          metadata: expect.objectContaining({
            email: 'user@example.com'
          })
        })
      );
    });

    it('devrait logger une tentative de connexion échouée', async () => {
      await auditLogger.logLoginAttempt(null, 'wrong@example.com', false, 'Invalid credentials');

      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection',
        expect.objectContaining({
          userId: 'anonymous',
          action: 'login',
          result: 'failure',
          severity: 'medium',
          metadata: expect.objectContaining({
            email: 'wrong@example.com',
            errorMessage: 'Invalid credentials'
          })
        })
      );
    });
  });

  describe('detectSuspiciousActivity', () => {
    beforeEach(() => {
      // Mock des documents retournés par Firestore
      const mockDocs = [
        { data: () => ({ result: 'failure', timestamp: { toDate: () => new Date() } }) },
        { data: () => ({ result: 'failure', timestamp: { toDate: () => new Date() } }) },
        { data: () => ({ result: 'failure', timestamp: { toDate: () => new Date() } }) },
        { data: () => ({ result: 'failure', timestamp: { toDate: () => new Date() } }) },
        { data: () => ({ result: 'failure', timestamp: { toDate: () => new Date() } }) }
      ];
      
      mockGetDocs.mockResolvedValue({
        docs: mockDocs
      } as any);
    });

    it('devrait détecter des échecs multiples et créer une alerte', async () => {
      await auditLogger.detectSuspiciousActivity('user-123');

      // Vérifier que l'alerte a été créée
      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection',
        expect.objectContaining({
          type: 'multiple_failures',
          userId: 'user-123',
          description: expect.stringContaining('5 actions échouées'),
          resolved: false
        })
      );
    });
  });

  describe('getUserAuditLogs', () => {
    it('devrait récupérer les logs d\'un utilisateur spécifique', async () => {
      await auditLogger.getUserAuditLogs('user-123', 10);

      expect(mockQuery).toHaveBeenCalledWith(
        'mock-collection',
        where('userId', '==', 'user-123'),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      expect(mockGetDocs).toHaveBeenCalled();
    });

    it('devrait récupérer tous les logs pour les admins', async () => {
      await auditLogger.getUserAuditLogs('all', 50);

      expect(mockQuery).toHaveBeenCalledWith(
        'mock-collection',
        orderBy('timestamp', 'desc'),
        limit(50)
      );
    });
  });

  describe('getSecurityAlerts', () => {
    it('devrait récupérer les alertes de sécurité', async () => {
      await auditLogger.getSecurityAlerts();

      expect(mockQuery).toHaveBeenCalledWith(
        'mock-collection',
        orderBy('timestamp', 'desc')
      );
      expect(mockGetDocs).toHaveBeenCalled();
    });
  });
});
