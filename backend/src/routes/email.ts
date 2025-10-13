import { Router } from 'express';
import { z } from 'zod';

import { env } from '../config/env';
import { AuthenticatedRequest, authenticate } from '../middleware/auth';

const router = Router();

const emailSchema = z.object({
  to: z.string().email(),
  cc: z.string().email().optional(),
  subject: z.string().min(1),
  message: z.string().min(1),
  provider: z.enum(['sendgrid', 'mailgun', 'resend']).optional(),
  attachments: z
    .array(
      z.object({
        filename: z.string(),
        content: z.string(),
        type: z.string().default('application/octet-stream')
      })
    )
    .optional()
});

router.post('/send', authenticate, async (req: AuthenticatedRequest, res) => {
  const validation = emailSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({ message: 'Invalid payload', issues: validation.error.flatten() });
    return;
  }

  const provider = validation.data.provider ?? 'sendgrid';
  const providerApiKeys = {
    sendgrid: env.SENDGRID_API_KEY,
    mailgun: env.MAILGUN_API_KEY,
    resend: env.RESEND_API_KEY
  } as const;

  if (!providerApiKeys[provider]) {
    res.status(503).json({ message: `${provider} API key not configured` });
    return;
  }

  try {
    const plainText = validation.data.message;
    const htmlContent = validation.data.message.replace(/\n/g, '<br/>');

    if (provider === 'sendgrid') {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${providerApiKeys.sendgrid}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: validation.data.to }],
              ...(validation.data.cc && { cc: [{ email: validation.data.cc }] }),
              subject: validation.data.subject
            }
          ],
          from: {
            email: env.SENDGRID_FROM_EMAIL ?? 'noreply@example.com',
            name: env.SENDGRID_FROM_NAME ?? 'Construction BTP'
          },
          content: [
            {
              type: 'text/plain',
              value: plainText
            },
            {
              type: 'text/html',
              value: htmlContent
            }
          ],
          ...(validation.data.attachments && {
            attachments: validation.data.attachments.map((attachment) => ({
              filename: attachment.filename,
              content: attachment.content,
              type: attachment.type,
              disposition: 'attachment'
            }))
          })
        })
      });

      if (!response.ok) {
        const error = await response.text();
        res.status(response.status).json({ message: 'SendGrid error', details: error });
        return;
      }
    } else if (provider === 'mailgun') {
      if (!env.MAILGUN_DOMAIN) {
        res.status(503).json({ message: 'Mailgun domain not configured' });
        return;
      }

      const formData = new FormData();
      formData.append('from', `${env.SENDGRID_FROM_NAME ?? 'Construction BTP'} <${env.SENDGRID_FROM_EMAIL ?? 'noreply@example.com'}>`);
      formData.append('to', validation.data.to);
      if (validation.data.cc) {
        formData.append('cc', validation.data.cc);
      }
      formData.append('subject', validation.data.subject);
      formData.append('text', plainText);
      formData.append('html', htmlContent);

      if (validation.data.attachments) {
        for (const attachment of validation.data.attachments) {
          const blob = new Blob([Buffer.from(attachment.content, 'base64')], {
            type: attachment.type ?? 'application/octet-stream'
          });
          formData.append('attachment', blob, attachment.filename);
        }
      }

      const response = await fetch(`https://api.mailgun.net/v3/${env.MAILGUN_DOMAIN}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`api:${providerApiKeys.mailgun}`).toString('base64')}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.text();
        res.status(response.status).json({ message: 'Mailgun error', details: error });
        return;
      }
    } else if (provider === 'resend') {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${providerApiKeys.resend}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `${env.SENDGRID_FROM_NAME ?? 'Construction BTP'} <${env.SENDGRID_FROM_EMAIL ?? 'noreply@example.com'}>`,
          to: [validation.data.to],
          ...(validation.data.cc && { cc: [validation.data.cc] }),
          subject: validation.data.subject,
          text: plainText,
          html: htmlContent,
          ...(validation.data.attachments && {
            attachments: validation.data.attachments.map((attachment) => ({
              filename: attachment.filename,
              content: attachment.content,
              type: attachment.type
            }))
          })
        })
      });

      if (!response.ok) {
        const error = await response.text();
        res.status(response.status).json({ message: 'Resend error', details: error });
        return;
      }
    }

    res.json({
      message: 'Email sent successfully',
      provider
    });
  } catch (error) {
    console.error('Email proxy error', error);
    res.status(500).json({ message: 'Email proxy error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
