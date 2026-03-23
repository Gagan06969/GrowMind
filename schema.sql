-- Tables for GrowMind App

-- CREATE SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    duration INTEGER NOT NULL,
    category TEXT,
    date TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CREATE TREES TABLE
CREATE TABLE IF NOT EXISTS public.trees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    position INTEGER NOT NULL,
    stage INTEGER NOT NULL,
    title TEXT NOT NULL,
    category TEXT,
    date TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Policies if needed (ensure RLS is handled in Supabase console as well)
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trees ENABLE ROW LEVEL SECURITY;

-- SESSIONS POLICIES
CREATE POLICY "Users can insert their own sessions" ON public.sessions 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own sessions" ON public.sessions 
FOR SELECT USING (auth.uid() = user_id);

-- TREES POLICIES
CREATE POLICY "Users can insert their own trees" ON public.trees 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own trees" ON public.trees 
FOR SELECT USING (auth.uid() = user_id);
