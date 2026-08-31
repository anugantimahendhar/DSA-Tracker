import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { progressService } from '../../services/progress.service';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  CheckCircle2,
  Flame,
  Clock,
  Bookmark,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  Target,
  RotateCcw,
} from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: progress, isLoading } = useQuery({
    queryKey: ['user-progress-summary'],
    queryFn: progressService.getSummary,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const solved = progress?.total_solved || 0;
  const attempted = progress?.total_attempted || 0;
  const streak = progress?.current_streak || 0;
  const longestStreak = progress?.longest_streak || 0;
  const total = progress?.total_published || 8;
  const diff = progress?.difficulty || { easy_solved: 0, easy_total: 0, medium_solved: 0, medium_total: 0, hard_solved: 0, hard_total: 0 };
  const percentSolved = Math.round((solved / Math.max(1, total)) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner: Soft peach #151515 */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#151515] border border-[#303030] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111111] border border-[#303030] text-[#ffffff] text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" /> Algorithmic Performance
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f5f5f5] tracking-tight">
            Personal Practice Dashboard
          </h1>
          <p className="text-sm text-[#b6b6b6]">
            Track your real-time problem completion, active solving streaks, and topic mastery.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => navigate('/problems')} rightIcon={<ArrowRight className="w-4 h-4" />}>
          Continue Practice
        </Button>
      </div>

      {/* First-time Onboarding Widget (if solved == 0) */}
      {solved === 0 && (
        <Card className="border-[#ffffff]/30 bg-[#1d1d1d]">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#111111] border border-[#151515] flex items-center justify-center text-[#ffffff] shrink-0 shadow-2xs">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#f5f5f5]">Ready to start your streak?</h3>
                <p className="text-xs text-[#b6b6b6] mt-0.5">
                  Begin with an Easy problem like <strong className="text-[#ffffff]">Two Sum</strong> or <strong className="text-[#ffffff]">Valid Parentheses</strong>.
                </p>
              </div>
            </div>
            <Button variant="primary" size="sm" onClick={() => navigate('/problems?difficulty=Easy')}>
              Start Easy Problem
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Key Metric Summary Cards: White #111111 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Problems Solved */}
        <Card className="border-[#3a3a3a] bg-[#111111]">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-[#858585] font-semibold">Problems Solved</span>
              <div className="text-2xl font-extrabold text-[#f5f5f5] font-mono mt-1">
                {solved} <span className="text-xs font-normal text-[#858585]">/ {total}</span>
              </div>
              <span className="text-[11px] text-[#e8e8e8] font-bold">{percentSolved}% Completed</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#171717] border border-[#3a3a3a] flex items-center justify-center text-[#e8e8e8]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Current Streak */}
        <Card className="border-[#444444] bg-[#111111]">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-[#858585] font-semibold">Current Streak</span>
              <div className="text-2xl font-extrabold text-[#f5f5f5] font-mono mt-1">
                {streak} <span className="text-xs font-normal text-[#858585]">Days</span>
              </div>
              <span className="text-[11px] text-[#d7d7d7] font-bold">Best: {longestStreak} Days</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#1b1b1b] border border-[#444444] flex items-center justify-center text-[#d7d7d7]">
              <Flame className="w-6 h-6 fill-[#d8d8d8] text-[#ffffff]" />
            </div>
          </CardContent>
        </Card>

        {/* Attempted */}
        <Card className="border-[#444444] bg-[#111111]">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-[#858585] font-semibold">Attempted</span>
              <div className="text-2xl font-extrabold text-[#f5f5f5] font-mono mt-1">{attempted}</div>
              <span className="text-[11px] text-[#d0d0d0] font-bold">In Progress</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#1b1b1b] border border-[#444444] flex items-center justify-center text-[#d0d0d0]">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Bookmarks */}
        <Card className="border-[#444444] bg-[#111111]">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-[#858585] font-semibold">Bookmarked</span>
              <div className="text-2xl font-extrabold text-[#f5f5f5] font-mono mt-1">{progress?.bookmark_count || 0}</div>
              <span className="text-[11px] text-[#d5d5d5] font-bold">Saved for later</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#1b1b1b] border border-[#444444] flex items-center justify-center text-[#d5d5d5]">
              <Bookmark className="w-6 h-6 fill-[#d5d5d5]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Difficulty Distribution + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Difficulty Distribution Widget */}
        <Card className="lg:col-span-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="w-4 h-4 text-[#ffffff]" /> Difficulty Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Easy */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#e8e8e8] font-bold">Easy</span>
                <span className="text-[#f5f5f5] font-bold">
                  {diff.easy_solved} / {diff.easy_total}
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#242424] overflow-hidden">
                <div
                  className="h-full bg-[#e8e8e8] rounded-full transition-all duration-500"
                  style={{ width: `${(diff.easy_solved / Math.max(1, diff.easy_total)) * 100}%` }}
                />
              </div>
            </div>

            {/* Medium */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#d0d0d0] font-bold">Medium</span>
                <span className="text-[#f5f5f5] font-bold">
                  {diff.medium_solved} / {diff.medium_total}
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#242424] overflow-hidden">
                <div
                  className="h-full bg-[#d0d0d0] rounded-full transition-all duration-500"
                  style={{ width: `${(diff.medium_solved / Math.max(1, diff.medium_total)) * 100}%` }}
                />
              </div>
            </div>

            {/* Hard */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#f0f0f0] font-bold">Hard</span>
                <span className="text-[#f5f5f5] font-bold">
                  {diff.hard_solved} / {diff.hard_total}
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#242424] overflow-hidden">
                <div
                  className="h-full bg-[#f0f0f0] rounded-full transition-all duration-500"
                  style={{ width: `${(diff.hard_solved / Math.max(1, diff.hard_total)) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Practice Shortcuts */}
        <Card className="lg:col-span-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#ffffff]" /> Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => navigate('/revision')}
              className="p-4 rounded-xl bg-[#080808] border border-[#303030] hover:bg-[#181818] hover:border-[#ffffff] cursor-pointer transition-all space-y-1 group shadow-2xs"
            >
              <div className="flex items-center justify-between text-[#ffffff] text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5" /> Revision Queue
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-[#b6b6b6]">Review solved and struggled problems.</p>
            </div>

            <div
              onClick={() => navigate('/analytics')}
              className="p-4 rounded-xl bg-[#080808] border border-[#303030] hover:bg-[#181818] hover:border-[#ffffff] cursor-pointer transition-all space-y-1 group shadow-2xs"
            >
              <div className="flex items-center justify-between text-[#e8e8e8] text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> Deep Analytics
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-[#b6b6b6]">Inspect error rate breakdown and timeline.</p>
            </div>

            <div
              onClick={() => navigate('/bookmarks')}
              className="p-4 rounded-xl bg-[#080808] border border-[#303030] hover:bg-[#181818] hover:border-[#ffffff] cursor-pointer transition-all space-y-1 group sm:col-span-2 shadow-2xs"
            >
              <div className="flex items-center justify-between text-[#d5d5d5] text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 fill-[#d5d5d5]" /> Bookmarked Questions ({progress?.bookmark_count || 0})
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-[#b6b6b6]">Jump directly to your marked practice list.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Topic Mastery Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4 text-[#ffffff]" /> Topic Mastery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {progress?.topics.map((t) => (
              <div key={t.topic} className="p-3.5 rounded-xl bg-[#080808] border border-[#303030] space-y-2 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-[#f5f5f5]">{t.topic}</span>
                  <span className="text-[#b6b6b6] font-semibold">
                    {t.solved}/{t.total} ({t.percentage}%)
                  </span>
                </div>
                {/* Progress bar: Bright orange #d8d8d8 on Pale peach #242424 */}
                <div className="w-full h-2 rounded-full bg-[#242424] overflow-hidden">
                  <div
                    className="h-full bg-[#d8d8d8] rounded-full transition-all duration-300"
                    style={{ width: `${t.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};