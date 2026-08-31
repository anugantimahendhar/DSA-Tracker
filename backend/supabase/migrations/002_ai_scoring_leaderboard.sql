-- AI scoring + leaderboard extension
CREATE TABLE IF NOT EXISTS public.ai_submission_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    score NUMERIC(4,1) NOT NULL CHECK (score >= 0 AND score <= 10),
    points_awarded NUMERIC(4,1) NOT NULL CHECK (points_awarded >= 0 AND points_awarded <= 10),
    difficulty TEXT NOT NULL,
    correctness_percent NUMERIC(5,1) NOT NULL,
    code_quality NUMERIC(4,1) NOT NULL,
    feedback TEXT NOT NULL DEFAULT '',
    generated_by TEXT NOT NULL DEFAULT 'rules',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_ai_score_per_submission UNIQUE (submission_id)
);
CREATE INDEX IF NOT EXISTS idx_ai_scores_user ON public.ai_submission_scores(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_scores_points ON public.ai_submission_scores(points_awarded DESC);
ALTER TABLE public.ai_submission_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view scores" ON public.ai_submission_scores FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
-- Server inserts through service-role key. No public insert policy is required.
