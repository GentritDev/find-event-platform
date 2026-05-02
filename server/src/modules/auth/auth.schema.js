'use strict';

const { z } = require('zod');

const registerSchema = z.object({
  full_name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  role: z.enum(['user', 'organizer']).optional().default('user'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

module.exports = { registerSchema, loginSchema };
