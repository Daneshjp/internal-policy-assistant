import { z } from 'zod';

/**
 * Email validation schema
 */
export const emailSchema = z.string().email('Invalid email address');

/**
 * Password validation schema
 * Minimum 8 characters, at least one uppercase, one lowercase, one number
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * Required string schema
 */
export const requiredStringSchema = z.string().min(1, 'This field is required');

/**
 * Optional string schema
 */
export const optionalStringSchema = z.string().optional();

/**
 * Positive number schema
 */
export const positiveNumberSchema = z.number().positive('Must be a positive number');

/**
 * Non-negative number schema
 */
export const nonNegativeNumberSchema = z.number().nonnegative('Must be a non-negative number');

/**
 * Date string schema
 */
export const dateStringSchema = z.string().refine(
  (val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  },
  { message: 'Invalid date format' }
);

/**
 * Future date schema
 */
export const futureDateSchema = dateStringSchema.refine(
  (val) => {
    const date = new Date(val);
    return date > new Date();
  },
  { message: 'Date must be in the future' }
);

/**
 * Past date schema
 */
export const pastDateSchema = dateStringSchema.refine(
  (val) => {
    const date = new Date(val);
    return date < new Date();
  },
  { message: 'Date must be in the past' }
);

/**
 * URL validation schema
 */
export const urlSchema = z.string().url('Invalid URL format');

/**
 * File size validation
 */
export const fileSizeSchema = (maxSizeInMB: number) =>
  z.custom<File>((file) => {
    if (!(file instanceof File)) return false;
    return file.size <= maxSizeInMB * 1024 * 1024;
  }, `File size must be less than ${maxSizeInMB}MB`);

/**
 * File type validation
 */
export const fileTypeSchema = (allowedTypes: string[]) =>
  z.custom<File>((file) => {
    if (!(file instanceof File)) return false;
    return allowedTypes.includes(file.type);
  }, `File type must be one of: ${allowedTypes.join(', ')}`);

/**
 * Phone number validation (basic)
 */
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');
