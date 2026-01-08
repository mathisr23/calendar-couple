
import { createClient } from '@supabase/supabase-js';

// TODO: In a real production app, these should be in .env
const SUPABASE_URL = 'https://pyojxofyabzabimsakam.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5b2p4b2Z5YWJ6YWJpbXNha2FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NjIyODcsImV4cCI6MjA4MzMzODI4N30.xBL1k5pelPjoN7qeqytf1xcwDYrfvYBORKgnJufGP0M';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

