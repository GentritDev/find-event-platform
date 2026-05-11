-- Add payment_method column to events table
-- Migration: 002_add_payment_method

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'paypal' 
CHECK (payment_method IN ('paypal', 'stripe', 'none'));
