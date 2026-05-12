-- Add availability columns to the products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS stock_level INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'available',
ADD COLUMN IF NOT EXISTS specifications TEXT;

-- Add an index for faster filtering of available products
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_level);
