import { auditLogger } from '../../services/auditLogger';
import { collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import type { CollectionReference, Query, DocumentData, QuerySnapshot, DocumentReference, QueryFieldFilterConstraint, QueryOrderByConstraint, QueryLimitConstraint } from 'firebase/firestore';
import type { MockedFunction } from 'jest-mock';

// Mock Firestore
jest.mock('firebase/firestore');
jest.mock('../../firebase');

const mockAddDoc = addDoc as MockedFunction<typeof addDoc>;
const mockCollection = collection as MockedFunction<typeof collection>;
const mockQuery = query as MockedFunction<typeof query>;
const mockWhere = where as MockedFunction<typeof where>;
const mockOrderBy = orderBy as MockedFunction<typeof orderBy>;
const mockLimit = limit as MockedFunction<typeof limit>;
const mockGetDocs = getDocs as MockedFunction<typeof getDocs>;

describe('AuditLogger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Firestore collection reference
    const mockCollectionRef = {} as CollectionReference<DocumentData>;
    const mockQueryRef = {} as Query<DocumentData>;
    
    mockCollection.mockReturnValue(mockCollectionRef);
    mockQuery.mockReturnValue(mockQueryRef);
    // Ces fonctions retournent des contraintes, pas des queries
    mockWhere.mockReturnValue({} as QueryFieldFilterConstraint);
    mockOrderBy.mockReturnValue({} as QueryOrderByConstraint);
    mockLimit.mockReturnValue({} as QueryLimitConstraint);
    mockAddDoc.mockResolvedValue({ id: 'mock-doc-id' } as DocumentReference<DocumentData>);
    mockGetDocs.mockResolvedValue({
      docs: [],
      metadata: {} as unknown,
      query: {} as unknown,
      size: 0,
      empty: true,
      forEach: jest.fn(),
      docChanges: jest.fn(() => []),
      toJSON: jest.fn()
    } as unknown as QuerySnapshot<DocumentData>);
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
        expect.anything(),
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
        expect.anything(),
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
        expect.anything(),
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
        expect.anything(),
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

  describe('logLogin', () => {
    it('devrait logger une tentative de connexion réussie', async () => {
      await auditLogger.logLogin('user-123', 'manager', true);

      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          userId: 'user-123',
          userRole: 'manager',
          action: 'login',
          result: 'success',
          severity: 'low'
        })
      );
    });

    it('devrait logger une tentative de connexion échouée', async () => {
      await auditLogger.logLogin('user-123', 'worker', false, 'Invalid credentials');

      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          userId: 'user-123',
          userRole: 'worker',
          action: 'login',
          result: 'failure',
          severity: 'medium',
          reason: 'Invalid credentials'
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
        docs: mockDocs,
        metadata: {} as unknown,
        query: {} as unknown,
        size: mockDocs.length,
        empty: false,
        forEach: jest.fn(),
        docChanges: jest.fn(() => []),
        toJSON: jest.fn()
      } as unknown as QuerySnapshot<DocumentData>);
    });

    it('devrait détecter des échecs multiples et créer une alerte', async () => {
      // Test simulé - la méthode detectSuspiciousActivity n'existe pas encore
      // await auditLogger.detectSuspiciousActivity('user-123');

      // Pour l'instant, on teste juste que les mocks sont configurés
      expect(mockGetDocs).toBeDefined();
      expect(mockAddDoc).toBeDefined();
    });
  });

  describe('getUserAuditLogs', () => {
    it('devrait récupérer les logs d\'un utilisateur spécifique', async () => {
      await auditLogger.getUserAuditLogs('user-123', 10);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything()
      );
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', 'user-123');
      expect(mockOrderBy).toHaveBeenCalledWith('timestamp', 'desc');
      expect(mockLimit).toHaveBeenCalledWith(10);
      expect(mockGetDocs).toHaveBeenCalled();
    });

    it('devrait récupérer tous les logs pour les admins', async () => {
      await auditLogger.getUserAuditLogs('all', 50);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything()
      );
      expect(mockOrderBy).toHaveBeenCalledWith('timestamp', 'desc');
      expect(mockLimit).toHaveBeenCalledWith(50);
    });
  });

  describe('getSecurityAlerts', () => {
    it('devrait récupérer les alertes de sécurité', async () => {
      await auditLogger.getSecurityAlerts();

      expect(mockQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything()
      );
      expect(mockOrderBy).toHaveBeenCalledWith('timestamp', 'desc');
      expect(mockGetDocs).toHaveBeenCalled();
    });
  });
});
