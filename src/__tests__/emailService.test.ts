import { describe, it, expect, vi, beforeEach } from 'vitest';
import { emailService, EmailData } from '../services/emailService';

// Mock PDF generator used by sendQuoteEmail
vi.mock('../services/pdf/quotePdf', () => ({
  generateQuotePdf: vi.fn(async () => new Blob(['%PDF-1.4 test'], { type: 'application/pdf' }))
}));

// Mock fetch pour les tests
global.fetch = vi.fn();

const mockEmailData: EmailData = {
  to: 'test@example.com',
  subject: 'Test Email',
  message: 'Test message content',
  attachPdf: false,
  sendCopy: false,
};

const mockQuote = {
  id: '1',
  title: 'Test Quote',
  reference: 'REF-001',
  clientName: 'Test Client',
  clientEmail: 'client@test.com',
  clientPhone: '123-456-7890',
  projectType: 'Construction',
  totalAmount: 5000,
  subtotal: 4500,
  taxAmount: 500,
  taxRate: 10,
  discountAmount: 0,
  items: [],
  phases: [],
  status: 'draft' as const,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  validUntil: '2024-02-01',
  companyName: 'Test Company',
  validityDays: 30,
};

describe('EmailService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fetch as any).mockClear();
  });

  describe('Configuration', () => {
    it('should configure SendGrid provider', () => {
      emailService.configure({
        provider: 'sendgrid',
        apiKey: 'test-api-key',
        fromEmail: 'test@example.com',
        fromName: 'Test Sender'
      });

      expect(emailService.isConfigured()).toBe(true);
    });

    it('should configure Mailgun provider', () => {
      emailService.configure({
        provider: 'mailgun',
        apiKey: 'test-api-key',
        fromEmail: 'test@example.com',
        fromName: 'Test Sender',
        domain: 'test.mailgun.org'
      });

      expect(emailService.isConfigured()).toBe(true);
    });

    it('should configure Resend provider', () => {
      emailService.configure({
        provider: 'resend',
        apiKey: 'test-api-key',
        fromEmail: 'test@example.com',
        fromName: 'Test Sender'
      });

      expect(emailService.isConfigured()).toBe(true);
    });
  });

  describe('SendGrid Integration', () => {
    beforeEach(() => {
      emailService.configure({
        provider: 'sendgrid',
        apiKey: 'test-sendgrid-key',
        fromEmail: 'sender@example.com',
        fromName: 'Test Sender'
      });
    });

    it('should send email via SendGrid successfully', async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        status: 202,
        json: () => Promise.resolve({ message: 'success' })
      });

      const result = await emailService.sendEmail(mockEmailData);

      expect(result.success).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.sendgrid.com/v3/mail/send',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-sendgrid-key',
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should handle SendGrid API error', async () => {
      (fetch as any).mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ errors: [{ message: 'Invalid API key' }] }),
        text: () => Promise.resolve('Invalid API key')
      });

      const result = await emailService.sendEmail(mockEmailData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid API key');
    });
  });

  describe('Mailgun Integration', () => {
    beforeEach(() => {
      emailService.configure({
        provider: 'mailgun',
        apiKey: 'test-mailgun-key',
        fromEmail: 'sender@example.com',
        fromName: 'Test Sender',
        domain: 'test.mailgun.org'
      });
    });

    it('should send email via Mailgun successfully', async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ message: 'Queued. Thank you.' })
      });

      const result = await emailService.sendEmail(mockEmailData);

      expect(result.success).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.mailgun.net/v3/test.mailgun.org/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Basic YXBpOnRlc3QtbWFpbGd1bi1rZXk='
          })
        })
      );
    });
  });

  describe('Resend Integration', () => {
    beforeEach(() => {
      emailService.configure({
        provider: 'resend',
        apiKey: 'test-resend-key',
        fromEmail: 'sender@example.com',
        fromName: 'Test Sender'
      });
    });

    it('should send email via Resend successfully', async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: 'email-id-123' })
      });

      const result = await emailService.sendEmail(mockEmailData);

      expect(result.success).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.resend.com/emails',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-resend-key',
            'Content-Type': 'application/json'
          })
        })
      );
    });
  });

  describe('Quote Email Functionality', () => {
    beforeEach(() => {
      emailService.configure({
        provider: 'sendgrid',
        apiKey: 'test-key',
        fromEmail: 'sender@example.com',
        fromName: 'Test Sender'
      });
    });

    it('should send quote email successfully', async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        status: 202,
        json: () => Promise.resolve({ message: 'success' })
      });

      const result = await emailService.sendQuoteEmail(mockQuote, mockEmailData);

      expect(result.success).toBe(true);
      expect(fetch).toHaveBeenCalled();
    });

    it('should handle quote email with PDF attachment', async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        status: 202,
        json: () => Promise.resolve({ message: 'success' })
      });

      const emailDataWithPdf = { ...mockEmailData, attachPdf: true };
      const result = await emailService.sendQuoteEmail(mockQuote, emailDataWithPdf);

      expect(result.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      emailService.configure({
        provider: 'sendgrid',
        apiKey: 'test-key',
        fromEmail: 'sender@example.com',
        fromName: 'Test Sender'
      });
    });

    it('should handle network errors', async () => {
      (fetch as any).mockRejectedValue(new Error('Network error'));

      const result = await emailService.sendEmail(mockEmailData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });

    it('should handle unconfigured service', async () => {
      const unconfiguredService = new (emailService.constructor as any)();
      
      const result = await unconfiguredService.sendEmail(mockEmailData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Service email non configuré');
    });
  });

  describe('Validation', () => {
    it('should validate email data', async () => {
      emailService.configure({
        provider: 'sendgrid',
        apiKey: 'test-key',
        fromEmail: 'sender@example.com',
        fromName: 'Test Sender'
      });

      const invalidEmailData = {
        to: 'invalid-email',
        subject: '',
        message: '',
        attachPdf: false,
        sendCopy: false,
      };

      const result = await emailService.sendEmail(invalidEmailData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
