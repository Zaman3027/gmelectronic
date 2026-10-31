import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import cors from 'cors';
import morgan from 'morgan';
import inquiriesRouter from './routes/inquiries.js';

export function createApp() {
  const app = express();

  // Skip request logging during tests to keep output clean.
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  app.use(express.json());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
        : '*',
    }),
  );

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'mondal-backend' });
  });

  app.use('/api/inquiries', inquiriesRouter);

  // 404 fallback
  app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'NotFound', path: req.path });
  });

  // Central error handler
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'InternalServerError' });
  });

  return app;
}
