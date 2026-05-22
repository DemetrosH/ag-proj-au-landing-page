-- Migration: Create rentman_allocations table to cache project allocations from Rentman

CREATE TABLE IF NOT EXISTS "public"."rentman_allocations" (
    "id" bigint PRIMARY KEY, -- Rentman projectequipment allocation ID
    "equipment_id" text NOT NULL, -- Rentman equipment ID (parsed from /equipment/123)
    "quantity" integer NOT NULL,
    "planperiod_start" timestamp with time zone NOT NULL,
    "planperiod_end" timestamp with time zone NOT NULL,
    "project_id" text,
    "last_synced" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE "public"."rentman_allocations" ENABLE ROW LEVEL SECURITY;

-- Allow public read access to allocations (so any visitor can verify stock availability)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'rentman_allocations' AND policyname = 'Allow public select of allocations'
    ) THEN
        CREATE POLICY "Allow public select of allocations" ON "public"."rentman_allocations" 
            FOR SELECT USING (true);
    END IF;
END $$;

-- Add index to optimize query performance for overlapping periods
CREATE INDEX IF NOT EXISTS idx_rentman_allocations_eq_dates 
ON "public"."rentman_allocations" ("equipment_id", "planperiod_start", "planperiod_end");
