import { z } from 'zod';

export const DEVICE_TYPES = [
  'Television',
  'Mobile',
  'Washing Machine',
  'Laptop',
  'Other',
] as const;

export type DeviceType = (typeof DEVICE_TYPES)[number];

export const inquirySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  phone: z.string().trim().min(3, 'Phone is required').max(40),
  email: z
    .string()
    .trim()
    .email('Must be a valid email')
    .max(200)
    .optional()
    .or(z.literal('')),
  deviceType: z.enum(DEVICE_TYPES),
  message: z.string().trim().min(1, 'Please describe the problem').max(2000),
});

export type InquiryInput = z.infer<typeof inquirySchema>;
