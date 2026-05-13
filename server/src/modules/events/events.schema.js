"use strict";

const { z } = require("zod");

const createEventSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters").max(180),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    category: z.string().max(80).optional(),
    location: z.string().min(2, "Location is required").max(180),
    start_at: z.string().datetime(),
    end_at: z.string().datetime(),

    price_eur: z.number().min(0).default(0),
    capacity: z.number().int().min(1),

    cover_image_url: z.string().url("Invalid image URL").optional(),

    status: z.enum(["draft", "published"]).default("draft"),
    organizer_id: z.coerce.string().uuid().optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.start_at);
      return start >= new Date();
    },
    {
      message: "Start date cannot be in the past",
      path: ["start_at"],
    },
  )
  .refine(
    (data) => {
      const start = new Date(data.start_at);
      const end = new Date(data.end_at);
      return end > start;
    },
    {
      message: "End date must be after start date",
      path: ["end_at"],
    },
  );

const updateEventSchema = z.object({
  title: z.string().min(3).max(180).optional(),
  description: z.string().min(10).optional(),
  category: z.string().max(80).optional(),
  location: z.string().min(2).max(180).optional(),

  start_at: z.string().datetime().optional(),
  end_at: z.string().datetime().optional(),

  price_eur: z.number().min(0).optional(),
  capacity: z.number().int().min(1).optional(),

  cover_image_url: z.string().url().optional(),

  status: z.enum(["draft", "published", "cancelled"]).optional(),
  organizer_id: z.coerce.string().uuid().optional(),
});

const eventQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  category: z.string().optional(),
  status: z.enum(["draft", "published", "cancelled"]).optional(),
  search: z.string().optional(),
});

module.exports = { createEventSchema, updateEventSchema, eventQuerySchema };
