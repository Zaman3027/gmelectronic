import { Router, type Request, type Response } from 'express';
import { inquirySchema } from '../schemas.js';
import { createInquiry, listInquiries } from '../db.js';

const router = Router();

// POST /api/inquiries — create a new inquiry
router.post('/', (req: Request, res: Response) => {
  const parsed = inquirySchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: 'ValidationError',
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const inquiry = createInquiry(parsed.data);
  return res.status(201).json(inquiry);
});

// GET /api/inquiries — list inquiries (admin; add auth before exposing)
router.get('/', (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  const offset = Number(req.query.offset) || 0;
  const items = listInquiries({ limit, offset });
  return res.json({ items, count: items.length });
});

export default router;
