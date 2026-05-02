'use strict';

const { z } = require('zod');

const createEventSchema = z.object({
  title: z.string().min(3).max(180),
  description: z.string().min(10),
  category: z.string().max(80).optional(),
  location: z.string().min(2).max(180),
  start_at: z.string().datetime(),
  end_at: z.string().datetime(),
  price_eur: z.number().min(0).default(0),
  capacity: z.number().int().min(1),
  cover_image_url: z.string().url().optional(),
  status: z.enum(['draft', 'published']).optional().default('draft'),
});

const updateEventSchema = createEventSchema.partial();

const eventQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  category: z.string().optional(),
  status: z.enum(['draft', 'published', 'cancelled']).optional(),
  search: z.string().optional(),
});

module.exports = { createEventSchema, updateEventSchema, eventQuerySchema };
