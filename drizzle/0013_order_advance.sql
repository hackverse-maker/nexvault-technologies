ALTER TABLE orders ADD COLUMN IF NOT EXISTS advance_amount numeric(12,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS balance_amount numeric(12,2) NOT NULL DEFAULT 0;

-- Backfill existing orders: 50% advance / 50% balance of final_amount.
UPDATE orders SET
  advance_amount = ROUND(final_amount * 0.5, 2),
  balance_amount = final_amount - ROUND(final_amount * 0.5, 2)
WHERE advance_amount = 0 AND balance_amount = 0;
