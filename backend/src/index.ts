import 'dotenv/config';
import cors from 'cors';
import express, { Request, Response } from 'express';

import { env } from './config/env';
import { firebaseAuth } from './config/firebase';
import aiRouter from './routes/ai';
import emailRouter from './routes/email';
import paymentsRouter from './routes/payments';

console.log('ENV CHECK', {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY
});
const app = express();
const port = Number(env.PORT);

app.use(cors());
app.use(express.json());

app.use('/ai', aiRouter);
app.use('/email', emailRouter);
app.use('/payments', paymentsRouter);

app.get('/health', async (_req: Request, res: Response) => {
  try {
    const firebaseProjectId = firebaseAuth.app.options.projectId;
    res.json({
      status: 'ok',
      service: 'construction-btp-backend',
      firebaseProjectId
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: (error as Error).message });
  }
});

app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});
