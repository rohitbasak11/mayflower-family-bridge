-- ==========================================
-- PHASE 2: AI FEEDBACK SYSTEM EXPANSION
-- ==========================================

-- 1. Update FEEDBACK table with AI and response fields
ALTER TABLE public.feedback 
DROP CONSTRAINT IF EXISTS feedback_status_check;

ALTER TABLE public.feedback 
ADD COLUMN IF NOT EXISTS ai_category text,
ADD COLUMN IF NOT EXISTS ai_priority text,
ADD COLUMN IF NOT EXISTS ai_sentiment text,
ADD COLUMN IF NOT EXISTS ai_summary text,
ADD COLUMN IF NOT EXISTS ai_draft text,
ADD COLUMN IF NOT EXISTS ai_confidence double precision,
ADD COLUMN IF NOT EXISTS ai_processed_at timestamptz,
ADD COLUMN IF NOT EXISTS final_category text,
ADD COLUMN IF NOT EXISTS final_priority text,
ADD COLUMN IF NOT EXISTS response text,
ADD COLUMN IF NOT EXISTS responded_by uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS responded_at timestamptz;

-- Update status constraint
ALTER TABLE public.feedback 
ADD CONSTRAINT feedback_status_check 
CHECK (status IN ('new', 'submitted', 'ai_processed', 'in_review', 'responded', 'resolved'));

-- 2. New table: AI PROCESSING LOG
CREATE TABLE IF NOT EXISTS public.ai_processing_log (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    feedback_id uuid REFERENCES public.feedback(id) ON DELETE CASCADE NOT NULL,
    model_used text NOT NULL,
    input_text text NOT NULL,
    output_json jsonb NOT NULL,
    latency_ms integer,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. New table: ADMIN OVERRIDES
CREATE TABLE IF NOT EXISTS public.admin_overrides (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    feedback_id uuid REFERENCES public.feedback(id) ON DELETE CASCADE NOT NULL,
    admin_id uuid REFERENCES public.profiles(id) NOT NULL,
    field_changed text NOT NULL CHECK (field_changed IN ('category', 'priority')),
    old_value text,
    new_value text NOT NULL,
    reason text,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. RLS POLICIES for new tables
ALTER TABLE public.ai_processing_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_overrides ENABLE ROW LEVEL SECURITY;

-- AI Processing Log: Admin only
CREATE POLICY "ai_log_admin_all" ON public.ai_processing_log 
FOR ALL USING (public.is_staff());

-- Admin Overrides: Admin only
CREATE POLICY "overrides_admin_all" ON public.admin_overrides 
FOR ALL USING (public.is_staff());

-- 5. Update feedback policies (if needed)
-- Ensure admins can update feedback for responses/overrides
DROP POLICY IF EXISTS "feedback_admin_update" ON public.feedback;
CREATE POLICY "feedback_admin_update" ON public.feedback 
FOR UPDATE USING (public.is_staff());
