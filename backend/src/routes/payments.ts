import { Router } from 'express';
import { z } from 'zod';

import { env } from '../config/env';
import { AuthenticatedRequest, authenticate } from '../middleware/auth';

const router = Router();

const initiateSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default('XOF'),
  phoneNumber: z.string().min(6),
  description: z.string().min(1),
  projectId: z.string().optional(),
  provider: z.enum(['flutterwave']).default('flutterwave')
});

router.post('/initiate', authenticate, async (req: AuthenticatedRequest, res) => {
  const validation = initiateSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({ message: 'Invalid payload', issues: validation.error.flatten() });
    return;
  }

  if (!env.FLUTTERWAVE_SECRET_KEY) {
    res.status(503).json({ message: 'Flutterwave secret key not configured' });
    return;
  }

  const customerEmail = req.claims?.email ?? 'client@example.com';
  const customerName = req.claims?.name ?? 'Client BTP';

  const payload = {
    tx_ref: `btp-${Date.now()}`,
    amount: validation.data.amount,
    currency: validation.data.currency,
    redirect_url: `${req.protocol}://${req.get('host')}/payments/callback`,
    customer: {
      email: customerEmail,
      phonenumber: validation.data.phoneNumber,
      name: customerName
    },
    payment_options: 'card,banktransfer,ussd',
    meta: {
      projectId: validation.data.projectId ?? null,
      description: validation.data.description
    }
  };

  try {
    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result: { status: string; message: string; data?: unknown } = await response.json();

    if (!response.ok) {
      res.status(response.status).json({ message: 'Flutterwave initiation error', details: result });
      return;
    }

    res.json({
      message: 'Payment initiation successful',
      data: result.data
    });
  } catch (error) {
    console.error('Flutterwave initiation error', error);
    res.status(500).json({ message: 'Payment initiation failed', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

const verifySchema = z.object({
  transactionId: z.string().min(1)
});

router.post('/verify', authenticate, async (req: AuthenticatedRequest, res) => {
  const validation = verifySchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({ message: 'Invalid payload', issues: validation.error.flatten() });
    return;
  }

  if (!env.FLUTTERWAVE_SECRET_KEY) {
    res.status(503).json({ message: 'Flutterwave secret key not configured' });
    return;
  }

  try {
    const response = await fetch(`https://api.flutterwave.com/v3/transactions/${validation.data.transactionId}/verify`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const result: { status: string; message: string; data?: unknown } = await response.json();

    if (!response.ok) {
      res.status(response.status).json({ message: 'Flutterwave verification error', details: result });
      return;
    }

    res.json({
      message: 'Payment verification successful',
      data: result.data
    });
  } catch (error) {
    console.error('Flutterwave verification error', error);
    res.status(500).json({ message: 'Payment verification failed', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
