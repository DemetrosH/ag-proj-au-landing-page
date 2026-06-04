-- Migration: Add discount_factor column to public.profiles table
ALTER TABLE "public"."profiles" ADD COLUMN IF NOT EXISTS "discount_factor" numeric DEFAULT 1.0;
COMMENT ON COLUMN "public"."profiles"."discount_factor" IS 'Custom discount factor assigned to the user (e.g. 0.85 for 15% off). Default is 1.0.';
