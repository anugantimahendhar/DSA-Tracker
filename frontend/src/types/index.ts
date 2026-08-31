export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  default_language: string;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  access_token: string;
}

export interface AuthResponse {
  user: UserProfile;
  session: AuthSession;
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type QuestionStatus = 'Draft' | 'Published' | 'Unpublished' | 'Deactivated';

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface TestCase {
  id?: string;
  input: string;
  expected_output: string;
  is_hidden: boolean;
  order_index: number;
}

export interface QuestionListItem {
  id: string;
  code: string;
  title: string;
  difficulty: Difficulty;
  topic: string;
  pattern?: string;
  company_tags: string[];
  status: QuestionStatus;
  user_status?: 'NOT_STARTED' | 'ATTEMPTED' | 'SOLVED';
  is_bookmarked: boolean;
}

export interface QuestionDetail {
  id: string;
  code: string;
  title: string;
  description: string;
  constraints: string;
  examples: Example[];
  explanation?: string | null;
  difficulty: Difficulty;
  topic: string;
  pattern?: string | null;
  company_tags: string[];
  status: QuestionStatus;
  starter_templates: Record<string, string>;
  is_bookmarked: boolean;
  user_status?: 'NOT_STARTED' | 'ATTEMPTED' | 'SOLVED';
  visible_test_cases: TestCase[];
}

export interface TestCaseRunResult {
  test_case_id: string;
  input: string;
  expected_output: string;
  actual_output: string;
  passed: boolean;
  status: string;
  runtime_ms: number;
  error_message?: string | null;
}

export interface CodeRunResponse {
  success: boolean;
  total_tests: number;
  passed_tests: number;
  results: TestCaseRunResult[];
  compile_output?: string | null;
}

export interface CodeSubmitResponse {
  submission_id: string;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error' | 'Compilation Error';
  passed_count: number;
  total_count: number;
  runtime_ms: number;
  memory_kb: number;
  compile_output?: string | null;
  ai_evaluation?: AISubmissionEvaluation | null;
}

export interface Submission {
  id: string;
  question_id: string;
  language: string;
  status: string;
  passed_count: number;
  total_count: number;
  runtime_ms?: number;
  memory_kb?: number;
  created_at: string;
}

export interface SubmissionDetail extends Submission {
  user_id: string;
  code: string;
  judge_reference?: string;
}

export interface DifficultyProgress {
  easy_solved: number;
  easy_total: number;
  medium_solved: number;
  medium_total: number;
  hard_solved: number;
  hard_total: number;
}

export interface TopicProgress {
  topic: string;
  solved: number;
  total: number;
  percentage: number;
}

export interface UserProgressSummary {
  total_published: number;
  total_solved: number;
  total_attempted: number;
  total_unsolved: number;
  current_streak: number;
  longest_streak: number;
  difficulty: DifficultyProgress;
  topics: TopicProgress[];
  bookmark_count: number;
  active_days_this_week: number;
}

export interface RevisionItem {
  id: string;
  question_id: string;
  question_title: string;
  question_code: string;
  difficulty: Difficulty;
  topic: string;
  status: 'Needs Revision' | 'Comfortable' | 'Mastered';
  due_date: string;
  last_reviewed_at: string;
  failed_attempts_count: number;
}

export interface ErrorBreakdown {
  error_type: string;
  count: number;
  percentage: number;
}

export interface ActivityDay {
  date: string;
  submissions_count: number;
  solved_count: number;
}

export interface AnalyticsOverview {
  total_submissions: number;
  accepted_submissions: number;
  acceptance_rate: number;
  total_solved: number;
  error_breakdown: ErrorBreakdown[];
  activity_timeline: ActivityDay[];
  weak_topics: string[];
  strong_topics: string[];
}

export interface AdminStats {
  total_questions: number;
  published_questions: number;
  draft_questions: number;
  total_users: number;
  total_submissions: number;
  difficulty_distribution: Record<string, number>;
  topic_distribution: Record<string, number>;
}
export interface AISubmissionEvaluation {
  score: number;
  points_awarded: number;
  difficulty: Difficulty;
  correctness_percent: number;
  code_quality: number;
  feedback: string;
  generated_by: string;
}

export interface AIQuestionDraft {
  code: string;
  title: string;
  description: string;
  constraints: string;
  examples: Example[];
  explanation: string;
  difficulty: Difficulty;
  topic: string;
  pattern?: string | null;
  company_tags: string[];
  starter_templates: Record<string, string>;
  suggested_test_cases: TestCase[];
  generated_by: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  email: string;
  total_points: number;
  average_score: number;
  scored_submissions: number;
  solved_count: number;
  current_streak: number;
}

export interface LeaderboardResponse {
  items: LeaderboardEntry[];
  current_user_rank?: number | null;
}


export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  question_id?: string | null;
  action_url?: string | null;
  is_read: boolean;
  created_at: string;
}
