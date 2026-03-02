-- ==========================================
-- 1. INITIAL SETUP & EXTENSIONS
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 2. TABLES DEFINITION (IDEMPOTENT)
-- ==========================================

-- PROFILES: Core user data
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
    email text NOT NULL,
    full_name text,
    avatar_url text,
    role text NOT NULL CHECK (role IN ('resident', 'family', 'staff')),
    credits integer DEFAULT 0 NOT NULL,
    room_number text,
    status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    updated_at timestamptz DEFAULT timezone('utc'::text, now()),
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- MESSAGES: Chat system
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    content text NOT NULL,
    image_url text,
    sender_id uuid REFERENCES public.profiles(id) NOT NULL,
    recipient_id uuid REFERENCES public.profiles(id),
    role_target text CHECK (role_target IN ('resident', 'family', 'staff')),
    "read" boolean DEFAULT false,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- SERVICES: Available care/amenity options
CREATE TABLE IF NOT EXISTS public.services (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    description text,
    cost_credits integer NOT NULL,
    category text,
    available boolean DEFAULT true,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- BOOKINGS: Appointments and Family Visits
CREATE TABLE IF NOT EXISTS public.bookings (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    resident_id uuid REFERENCES public.profiles(id) NOT NULL,
    service_id uuid REFERENCES public.services(id),
    family_id uuid REFERENCES public.profiles(id),
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    scheduled_for timestamptz,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CREDIT TRANSACTIONS: Ledger for gifts/payments
CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    amount integer NOT NULL,
    from_user_id uuid REFERENCES public.profiles(id) NOT NULL,
    to_user_id uuid REFERENCES public.profiles(id) NOT NULL,
    type text DEFAULT 'gift' CHECK (type IN ('gift', 'service_payment', 'refund')),
    description text,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- FEEDBACK: Resident/Family suggestions
CREATE TABLE IF NOT EXISTS public.feedback (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) NOT NULL,
    category text CHECK (category IN ('Dining', 'Temperature', 'Activity', 'Staff', 'General')),
    content text NOT NULL,
    status text DEFAULT 'submitted' CHECK (status IN ('submitted', 'ai_processed', 'in_review', 'responded', 'resolved')),
    
    -- AI Analysis Fields
    ai_category text,
    ai_priority text,
    ai_sentiment text,
    ai_summary text,
    ai_draft text,
    ai_confidence double precision,
    ai_processed_at timestamptz,
    
    -- Admin/Final Response Fields
    final_category text,
    final_priority text,
    response text,
    responded_by uuid REFERENCES public.profiles(id),
    responded_at timestamptz,
    
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- AI PROCESSING LOG: GPT-4o-mini performance tracking
CREATE TABLE IF NOT EXISTS public.ai_processing_log (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    feedback_id uuid REFERENCES public.feedback(id) ON DELETE CASCADE NOT NULL,
    model_used text NOT NULL,
    input_text text NOT NULL,
    output_json jsonb NOT NULL,
    latency_ms integer,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ADMIN OVERRIDES: Manual corrections log
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


-- CONSENTS: Legal documents
CREATE TABLE IF NOT EXISTS public.consents (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    resident_id uuid REFERENCES public.profiles(id) NOT NULL,
    document_name text NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'signed')),
    signed_at timestamptz,
    document_url text,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- GALLERY: Activity photos
CREATE TABLE IF NOT EXISTS public.gallery (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    url text NOT NULL,
    title text,
    category text DEFAULT 'Activities',
    uploaded_by uuid REFERENCES public.profiles(id),
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 3. HELPER FUNCTIONS & TRIGGERS
-- ==========================================

-- Function to check if user is Staff (Security Definer)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'staff'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ATOMIC Credit Transfer Function
CREATE OR REPLACE FUNCTION public.process_credit_transfer(
  p_from_user_id uuid,
  p_to_user_id uuid,
  p_amount integer,
  p_description text DEFAULT 'Gift'
)
RETURNS void AS $$
DECLARE
  v_sender_credits integer;
BEGIN
  -- Check credits (unless staff)
  SELECT credits INTO v_sender_credits FROM public.profiles WHERE id = p_from_user_id;
  
  IF v_sender_credits < p_amount AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_from_user_id AND role = 'staff') THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  -- Deduct from sender (unless staff)
  UPDATE public.profiles SET credits = credits - p_amount 
  WHERE id = p_from_user_id AND role != 'staff';

  -- Add to recipient
  UPDATE public.profiles SET credits = credits + p_amount WHERE id = p_to_user_id;

  -- Record transaction
  INSERT INTO public.credit_transactions (amount, from_user_id, to_user_id, description, type)
  VALUES (p_amount, p_from_user_id, p_to_user_id, p_description, 'gift');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Automatically handle profile creation on Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name, credits)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'family'),
    NEW.raw_user_meta_data->>'full_name',
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_processing_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_overrides ENABLE ROW LEVEL SECURITY;

-- PROFILES
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL USING (is_staff());

-- MESSAGES
DROP POLICY IF EXISTS "messages_select" ON public.messages;
CREATE POLICY "messages_select" ON public.messages FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id OR role_target = (SELECT role FROM profiles WHERE id = auth.uid()) OR is_staff()
);
DROP POLICY IF EXISTS "messages_insert" ON public.messages;
CREATE POLICY "messages_insert" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- SERVICES
DROP POLICY IF EXISTS "services_select" ON public.services;
CREATE POLICY "services_select" ON public.services FOR SELECT USING (true);
DROP POLICY IF EXISTS "services_admin" ON public.services;
CREATE POLICY "services_admin" ON public.services FOR ALL USING (is_staff());

-- BOOKINGS
DROP POLICY IF EXISTS "bookings_select" ON public.bookings;
CREATE POLICY "bookings_select" ON public.bookings FOR SELECT USING (auth.uid() = resident_id OR auth.uid() = family_id OR is_staff());
DROP POLICY IF EXISTS "bookings_insert" ON public.bookings;
CREATE POLICY "bookings_insert" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = resident_id OR auth.uid() = family_id);
DROP POLICY IF EXISTS "bookings_update_admin" ON public.bookings;
CREATE POLICY "bookings_update_admin" ON public.bookings FOR UPDATE USING (is_staff());

-- CREDIT TRANSACTIONS
DROP POLICY IF EXISTS "credits_select" ON public.credit_transactions;
CREATE POLICY "credits_select" ON public.credit_transactions FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id OR is_staff());

-- GALLERY
DROP POLICY IF EXISTS "gallery_select" ON public.gallery;
CREATE POLICY "gallery_select" ON public.gallery FOR SELECT USING (true);
DROP POLICY IF EXISTS "gallery_admin" ON public.gallery;
CREATE POLICY "gallery_admin" ON public.gallery FOR ALL USING (is_staff());

-- AI LOGS & OVERRIDES (Admin only)
DROP POLICY IF EXISTS "ai_log_admin_all" ON public.ai_processing_log;
CREATE POLICY "ai_log_admin_all" ON public.ai_processing_log FOR ALL USING (is_staff());
DROP POLICY IF EXISTS "overrides_admin_all" ON public.admin_overrides;
CREATE POLICY "overrides_admin_all" ON public.admin_overrides FOR ALL USING (is_staff());

-- FEEDBACK
DROP POLICY IF EXISTS "feedback_select_own" ON public.feedback;
CREATE POLICY "feedback_select_own" ON public.feedback FOR SELECT USING (auth.uid() = user_id OR is_staff());
DROP POLICY IF EXISTS "feedback_insert_own" ON public.feedback;
CREATE POLICY "feedback_insert_own" ON public.feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "feedback_admin_all" ON public.feedback;
CREATE POLICY "feedback_admin_all" ON public.feedback FOR ALL USING (is_staff());

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON public.messages (recipient_id);
