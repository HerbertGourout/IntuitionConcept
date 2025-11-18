import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProjectProvider } from '../../contexts/ProjectContext';
import { AuthProvider } from '../../contexts/AuthContext';
import QuoteGenerator from '../../components/Quotes/QuoteGenerator';
import { vi } from 'vitest';
import { QuotesService } from '../../services/quotesService';

// Mock Firebase
vi.mock('../../firebase', () => ({
  db: {},
  auth: {
    currentUser: {
      uid: 'test-user-id',
      email: 'test@example.com'
    }
  }
}));

// Mock services
vi.mock('../../services/quotesService', () => ({
  default: {
    createQuote: vi.fn().mockResolvedValue({
      id: 'quote-1',
      title: 'Test Quote',
      clientName: 'Test Client',
      phases: [],
      totalAmount: 0,
      status: 'draft'
    }),
    getAllQuotes: vi.fn().mockResolvedValue([]),
    updateQuote: vi.fn().mockResolvedValue(true),
    deleteQuote: vi.fn().mockResolvedValue(true)
  }
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>
      <ProjectProvider>
        {children}
      </ProjectProvider>
    </AuthProvider>
  </BrowserRouter>
);

describe('Quote Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should create a structured quote with default phase', async () => {
    render(
      <TestWrapper>
        <QuoteGenerator />
      </TestWrapper>
    );

    // Click "Commencer un nouveau devis structuré"
    const startButton = screen.getByText(/commencer un nouveau devis structuré/i);
    fireEvent.click(startButton);

    // Should show quote form with default phase
    await waitFor(() => {
      expect(screen.getByText(/phase 1 - préparation/i)).toBeInTheDocument();
    });

    // Fill client information
    const clientInput = screen.getByLabelText(/nom du client/i);
    fireEvent.change(clientInput, { target: { value: 'Test Client' } });

    const titleInput = screen.getByLabelText(/titre du devis/i);
    fireEvent.change(titleInput, { target: { value: 'Test Quote Title' } });

    // Add a task to the phase
    const addTaskButton = screen.getByText(/ajouter une tâche/i);
    fireEvent.click(addTaskButton);

    // Fill task details
    const taskNameInput = screen.getByLabelText(/nom de la tâche/i);
    fireEvent.change(taskNameInput, { target: { value: 'Test Task' } });

    const taskPriceInput = screen.getByLabelText(/prix/i);
    fireEvent.change(taskPriceInput, { target: { value: '1000' } });

    // Save task
    const saveTaskButton = screen.getByText(/sauvegarder la tâche/i);
    fireEvent.click(saveTaskButton);

    // Save quote
    const saveQuoteButton = screen.getByText(/sauvegarder/i);
    fireEvent.click(saveQuoteButton);

    // Verify quote was created
    await waitFor(() => {
      expect(QuotesService.createQuote).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Quote Title',
          clientName: 'Test Client',
          phases: expect.arrayContaining([
            expect.objectContaining({
              name: 'Phase 1 - Préparation',
              tasks: expect.arrayContaining([
                expect.objectContaining({
                  name: 'Test Task',
                  price: 1000
                })
              ])
            })
          ])
        })
      );
    });
  });

  test('should validate required fields before saving', async () => {
    render(
      <TestWrapper>
        <QuoteGenerator />
      </TestWrapper>
    );

    // Start new quote
    const startButton = screen.getByText(/commencer un nouveau devis structuré/i);
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText(/phase 1 - préparation/i)).toBeInTheDocument();
    });

    // Try to save without client name
    const saveQuoteButton = screen.getByText(/sauvegarder/i);
    fireEvent.click(saveQuoteButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/veuillez saisir le nom du client/i)).toBeInTheDocument();
    });
  });

  test('should calculate total amount correctly', async () => {
    render(
      <TestWrapper>
        <QuoteGenerator />
      </TestWrapper>
    );

    // Start new quote
    const startButton = screen.getByText(/commencer un nouveau devis structuré/i);
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText(/phase 1 - préparation/i)).toBeInTheDocument();
    });

    // Add multiple tasks with different prices
    const addTaskButton = screen.getByText(/ajouter une tâche/i);
    
    // First task
    fireEvent.click(addTaskButton);
    const taskName1 = screen.getByLabelText(/nom de la tâche/i);
    const taskPrice1 = screen.getByLabelText(/prix/i);
    fireEvent.change(taskName1, { target: { value: 'Task 1' } });
    fireEvent.change(taskPrice1, { target: { value: '500' } });
    
    const saveTask1 = screen.getByText(/sauvegarder la tâche/i);
    fireEvent.click(saveTask1);

    // Second task
    fireEvent.click(addTaskButton);
    const taskName2 = screen.getAllByLabelText(/nom de la tâche/i)[1];
    const taskPrice2 = screen.getAllByLabelText(/prix/i)[1];
    fireEvent.change(taskName2, { target: { value: 'Task 2' } });
    fireEvent.change(taskPrice2, { target: { value: '750' } });
    
    const saveTask2 = screen.getAllByText(/sauvegarder la tâche/i)[1];
    fireEvent.click(saveTask2);

    // Check total calculation
    await waitFor(() => {
      expect(screen.getByText(/1 250/)).toBeInTheDocument(); // Total: 500 + 750
    });
  });

  test('should handle quote duplication', async () => {
    // Mock existing quote
    const quotesService = await import('../../services/quotesService');
    vi.mocked(quotesService.default.getAllQuotes).mockResolvedValueOnce([
      {
        id: 'existing-quote',
        title: 'Existing Quote',
        clientName: 'Existing Client',
        phases: [{
          id: 'phase-1',
          name: 'Phase 1',
          description: 'Test phase',
          tasks: [],
          totalPrice: 1000,
          expanded: true
        }],
        totalAmount: 1000,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]);

    render(
      <TestWrapper>
        <QuoteGenerator />
      </TestWrapper>
    );

    // Open quotes modal
    const myQuotesButton = screen.getByText(/mes devis/i);
    fireEvent.click(myQuotesButton);

    await waitFor(() => {
      expect(screen.getByText('Existing Quote')).toBeInTheDocument();
    });

    // Click duplicate button
    const duplicateButton = screen.getByText(/dupliquer/i);
    fireEvent.click(duplicateButton);

    // Should load duplicated quote for editing
    await waitFor(() => {
      expect(screen.getByDisplayValue('Existing Quote (Copie)')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Existing Client')).toBeInTheDocument();
    });
  });
});
