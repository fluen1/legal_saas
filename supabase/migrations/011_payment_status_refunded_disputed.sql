-- Add refunded and disputed values to payment_status enum
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'refunded';
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'disputed';
