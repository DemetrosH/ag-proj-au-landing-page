-- Create sync_logs table to track background sync operations
CREATE TABLE IF NOT EXISTS public.sync_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    source TEXT NOT NULL, -- e.g., 'cron', 'manual'
    status TEXT NOT NULL, -- e.g., 'started', 'success', 'error'
    duration_ms INTEGER,
    items_processed INTEGER,
    error_message TEXT
);

-- Enable Row Level Security (RLS) but allow anonymous/authenticated users to view it 
-- (assuming this is an internal admin thing, but we will leave RLS simple)
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- Allow public access for now since admin dashboard might need it
CREATE POLICY "Enable read access for all users" ON public.sync_logs FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.sync_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.sync_logs FOR UPDATE USING (true) WITH CHECK (true);
