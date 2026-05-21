-- 1. Add checkout and Rentman fields to the 'soumissions' table
ALTER TABLE "public"."soumissions" 
  ADD COLUMN IF NOT EXISTS "delivery_method" text,
  ADD COLUMN IF NOT EXISTS "subtotal" numeric,
  ADD COLUMN IF NOT EXISTS "tps" numeric,
  ADD COLUMN IF NOT EXISTS "tvq" numeric,
  ADD COLUMN IF NOT EXISTS "rentman_id" text;

COMMENT ON COLUMN "public"."soumissions"."delivery_method" IS 'Method of delivery selected by the client: pickup or delivery';
COMMENT ON COLUMN "public"."soumissions"."subtotal" IS 'Estimated subtotal amount before taxes';
COMMENT ON COLUMN "public"."soumissions"."tps" IS 'Calculated TPS tax amount (5%)';
COMMENT ON COLUMN "public"."soumissions"."tvq" IS 'Calculated TVQ tax amount (9.975%)';
COMMENT ON COLUMN "public"."soumissions"."rentman_id" IS 'The linked project request ID generated in Rentman';


-- 2. Create the 'partner_inquiries' table if it does not exist
CREATE TABLE IF NOT EXISTS "public"."partner_inquiries" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    "name" text NOT NULL,
    "company" text,
    "email" text NOT NULL,
    "message" text NOT NULL
);

-- Enable Row Level Security (RLS) on partner_inquiries
ALTER TABLE "public"."partner_inquiries" ENABLE ROW LEVEL SECURITY;

-- Policy to allow anonymous submissions (Insert Only)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'partner_inquiries' AND policyname = 'Allow anonymous inserts'
    ) THEN
        CREATE POLICY "Allow anonymous inserts" ON "public"."partner_inquiries" 
            FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- Policy to allow admin profiles to view inquiries
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'partner_inquiries' AND policyname = 'Allow admins to read inquiries'
    ) THEN
        CREATE POLICY "Allow admins to read inquiries" ON "public"."partner_inquiries" 
            FOR SELECT TO authenticated USING (
                EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
                )
            );
    END IF;
END $$;
