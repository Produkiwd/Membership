-- Run this SQL in your Supabase SQL Editor to create the module_materials table

CREATE TABLE module_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE module_materials ENABLE ROW LEVEL SECURITY;

-- Allow read access for everyone (or authenticated users)
CREATE POLICY "Allow read access for authenticated users" ON module_materials
  FOR SELECT TO authenticated USING (true);

-- Allow all authenticated users to insert/delete (or restrict to admin)
CREATE POLICY "Allow all for authenticated users" ON module_materials
  FOR ALL TO authenticated USING (true);
