import { z } from 'zod';

export const propertySchema = z.object({
  streetAddress: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
  offerPrice: z.string().min(1, 'Offer price is required'),
  ownerId: z.number().int().positive('Owner ID must be a positive integer'),
  teamId: z.number().int().positive('Team ID must be a positive integer'),
});
