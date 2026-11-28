CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  phone_number text NOT NULL,
  email text,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  plan_name text NOT NULL,
  plan_price numeric(12,2) NOT NULL,
  compare_price numeric(12,2),
  discount_amount numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'PKR',
  final_amount numeric(12,2) NOT NULL,
  payment_method text NOT NULL,
  payment_status text NOT NULL DEFAULT 'unpaid',
  order_status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT orders_payment_method_check CHECK (payment_method IN ('cash','online')),
  CONSTRAINT orders_payment_status_check CHECK (payment_status IN ('unpaid','pending_verification','paid','failed','refunded')),
  CONSTRAINT orders_order_status_check CHECK (order_status IN ('pending','confirmed','in_progress','completed','cancelled')),
  CONSTRAINT orders_amounts_check CHECK (plan_price >= 0 AND final_amount >= 0)
);
CREATE INDEX IF NOT EXISTS orders_created_idx ON orders (created_at);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (order_status, payment_status);
