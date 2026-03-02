import asyncio
from sqlalchemy import text
from app.db import engine

MIGRATION_SQL = """
-- 1. Add missing AI columns to feedback table
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS ai_category text;
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS ai_priority text;
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS ai_sentiment text;
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS ai_summary text;
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS ai_draft text;
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS ai_confidence double precision;
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS ai_processed_at timestamptz;

-- 2. Add missing Admin/Final columns to feedback table
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS final_category text;
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS final_priority text;
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS response text;
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS responded_by uuid REFERENCES public.profiles(id);
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS responded_at timestamptz;

-- 3. Update check constraints
ALTER TABLE public.feedback DROP CONSTRAINT IF EXISTS feedback_status_check;
ALTER TABLE public.feedback ADD CONSTRAINT feedback_status_check CHECK (status IN ('submitted', 'ai_processed', 'in_review', 'responded', 'resolved'));

ALTER TABLE public.feedback DROP CONSTRAINT IF EXISTS feedback_category_check;
ALTER TABLE public.feedback ADD CONSTRAINT feedback_category_check CHECK (category IN ('Dining', 'Temperature', 'Activity', 'Staff', 'General'));

-- 4. Create AI Processing Log table if not exists
CREATE TABLE IF NOT EXISTS public.ai_processing_log (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    feedback_id uuid REFERENCES public.feedback(id) ON DELETE CASCADE NOT NULL,
    model_used text NOT NULL,
    input_text text NOT NULL,
    output_json jsonb NOT NULL,
    latency_ms integer,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Admin Overrides table if not exists
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

-- 6. Enable RLS and add basic policies (re-running is fine)
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_processing_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "feedback_select_own" ON public.feedback;
CREATE POLICY "feedback_select_own" ON public.feedback FOR SELECT USING (auth.uid() = user_id OR (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role = 'staff')));

DROP POLICY IF EXISTS "feedback_insert_own" ON public.feedback;
CREATE POLICY "feedback_insert_own" ON public.feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "feedback_admin_all" ON public.feedback;
CREATE POLICY "feedback_admin_all" ON public.feedback FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role = 'staff'));

DROP POLICY IF EXISTS "ai_log_admin_all" ON public.ai_processing_log;
CREATE POLICY "ai_log_admin_all" ON public.ai_processing_log FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role = 'staff'));

DROP POLICY IF EXISTS "overrides_admin_all" ON public.admin_overrides;
CREATE POLICY "overrides_admin_all" ON public.admin_overrides FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role = 'staff'));
"""

async def apply_migration():
    print("Applying Task 3 Migration...")
    async with engine.begin() as conn:
        # Split by semicolon and run each statement to avoid pgbouncer issues with multi-statement blocks
        # Wait, pg-bouncer handles multi-statement if not prepared.
        # But let's be safe.
        for statement in MIGRATION_SQL.split(";"):
            clean_stmt = statement.strip()
            if clean_stmt:
                print(f"Executing: {clean_stmt[:50]}...")
                await conn.execute(text(clean_stmt))
    print("Migration applied successfully!")

if __name__ == "__main__":
    asyncio.run(apply_migration())
