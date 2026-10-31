export interface InquiryPayload {
  name: string;
  phone: string;
  email?: string;
  deviceType: string;
  message: string;
}

export interface Inquiry extends InquiryPayload {
  id: number;
  createdAt: string;
}

export class ApiError extends Error {
  details?: Record<string, string[]>;
  constructor(message: string, details?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.details = details;
  }
}

const BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

export async function submitInquiry(payload: InquiryPayload): Promise<Inquiry> {
  if (import.meta.env.PROD && !import.meta.env.VITE_API_BASE_URL) {
    throw new ApiError('Online inquiries are currently unavailable. Please contact the shop directly.');
  }
  const res = await fetch(`${BASE}/inquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(data.error || 'Request failed', data.details);
  }
  return data as Inquiry;
}

