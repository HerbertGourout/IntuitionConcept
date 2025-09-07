import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, test, expect, beforeEach, vi } from 'vitest';
import QuoteEmailSender from '../components/Quotes/QuoteEmailSender';
import { toast } from 'react-hot-toast';

// Mock du service d'email
vi.mock('../services/emailService', () => ({
  emailService: {
    sendEmail: vi.fn(),
    isConfigured: vi.fn(() => true),
  },
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockQuote = {
  id: '1',
  title: 'Devis Test',
  reference: 'DEV-001',
  clientName: 'Client Test',
  clientEmail: 'client@test.com',
  clientPhone: '+33123456789',
  companyName: 'Entreprise Test',
  totalAmount: 10000,
  subtotal: 8500,
  taxRate: 18,
  taxAmount: 1500,
  status: 'draft' as const,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  items: [],
  phases: [],
  validityDays: 30,
  projectType: 'Construction',
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};

const mockProps = {
  quote: mockQuote,
  onSend: vi.fn(),
  onClose: vi.fn(),
};

describe('QuoteEmailSender', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render email form correctly', () => {
    render(<QuoteEmailSender {...mockProps} />);
    
    expect(screen.getByDisplayValue('client@test.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue(/Devis DEV-001/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Envoyer l'Email/i })).toBeInTheDocument();
  });

  it('should show email templates', async () => {
    render(<QuoteEmailSender {...mockProps} />);
    
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByText('Relance')).toBeInTheDocument();
    expect(screen.getByText('Urgence')).toBeInTheDocument();
  });

  it('should update email content when template is selected', async () => {
    const user = userEvent.setup();
    render(<QuoteEmailSender {...mockProps} />);
    
    const followUpButton = screen.getByText('Relance');
    await user.click(followUpButton);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue(/Nous espérons que vous allez bien/)).toBeInTheDocument();
    });
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    render(<QuoteEmailSender {...mockProps} />);
    
    // Vider le champ email
    const emailInput = screen.getByDisplayValue('client@test.com');
    await user.clear(emailInput);
    
    const sendButton = screen.getByRole('button', { name: /Envoyer l'Email/i });
    await user.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText("L'adresse email du destinataire est requise")).toBeInTheDocument();
    });
  });

  it('should validate email format', async () => {
    const user = userEvent.setup();
    render(<QuoteEmailSender {...mockProps} />);
    
    const emailInput = screen.getByDisplayValue('client@test.com');
    await user.clear(emailInput);
    await user.type(emailInput, 'invalid-email');
    
    const sendButton = screen.getByRole('button', { name: /Envoyer l'Email/i });
    await user.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText("Adresse email invalide")).toBeInTheDocument();
    });
  });

  it('should handle successful email sending', async () => {
    mockProps.onSend.mockResolvedValue(undefined);
    
    const user = userEvent.setup();
    render(<QuoteEmailSender {...mockProps} />);
    
    const sendButton = screen.getByRole('button', { name: /Envoyer l'Email/i });
    await user.click(sendButton);
    
    await waitFor(() => {
      expect(mockProps.onSend).toHaveBeenCalled();
    });
  });

  test('should handle email sending error', async () => {
    mockProps.onSend.mockRejectedValue(new Error('Erreur réseau'));
    
    const user = userEvent.setup();
    render(<QuoteEmailSender {...mockProps} />);
    
    const sendButton = screen.getByRole('button', { name: /Envoyer l'Email/i });
    await user.click(sendButton);
    
    await waitFor(() => {
      expect((toast.error as unknown as { mock: { calls: unknown[] } }).mock.calls.length).toBeGreaterThan(0);
    });
  });

  test('should toggle PDF attachment option', async () => {
    const user = userEvent.setup();
    render(<QuoteEmailSender {...mockProps} />);
    
    const pdfCheckbox = screen.getByLabelText(/Joindre le PDF du devis/);
    expect(pdfCheckbox).toBeChecked(); // Par défaut coché
    
    await user.click(pdfCheckbox);
    expect(pdfCheckbox).not.toBeChecked();
  });

  test('should toggle copy to sender option', async () => {
    const user = userEvent.setup();
    render(<QuoteEmailSender {...mockProps} />);
    
    const copyCheckbox = screen.getByLabelText(/M'envoyer une copie/);
    expect(copyCheckbox).not.toBeChecked(); // Par défaut non coché
    
    await user.click(copyCheckbox);
    expect(copyCheckbox).toBeChecked();
  });

  test('should close modal when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<QuoteEmailSender {...mockProps} />);
    
    const cancelButton = screen.getByText('Annuler');
    await user.click(cancelButton);
    
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  test('should show loading state during email sending', async () => {
    mockProps.onSend.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
    
    const user = userEvent.setup();
    render(<QuoteEmailSender {...mockProps} />);
    
    const sendButton = screen.getByRole('button', { name: /Envoyer l'Email/i });
    await user.click(sendButton);
    
    expect(screen.getByText('Envoi en cours...')).toBeInTheDocument();
  });
});
