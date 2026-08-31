import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Medal, Flame, BrainCircuit } from 'lucide-react';
import { aiService } from '../../services/ai.service';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';

export const Leaderboard: React.FC = () => {
  const { data, isLoading } = useQuery({ queryKey: ['ai-leaderboard'], queryFn: aiService.getLeaderboard });

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-7">
      <div className="depth-panel p-7 sm:p-9 rounded-[28px] flex flex-col sm:flex-row sm:items-end justify-between gap-5">
        <div>
          <div className="eyebrow"><BrainCircuit className="w-4 h-4" /> AI PERFORMANCE BOARD</div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-3">Scoreboard</h1>
          <p className="text-sm text-[#a3a3a3] mt-2 max-w-2xl">Scores are generated after each submission from judge correctness, question difficulty and code-quality signals. Learners are ranked by cumulative points.</p>
        </div>
        {data?.current_user_rank && <div className="score-orb"><span>Your rank</span><strong>#{data.current_user_rank}</strong></div>}
      </div>

      <Card className="overflow-hidden">
        <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5" /> Top Learners</CardTitle></CardHeader>
        <CardContent className="p-0">
          {isLoading ? <div className="p-6 space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16" />)}</div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-[#2b2b2b] text-[#8f8f8f] text-xs uppercase tracking-wider"><th className="p-4 text-left">Rank</th><th className="p-4 text-left">Learner</th><th className="p-4 text-right">Points</th><th className="p-4 text-right">Avg</th><th className="p-4 text-right">Solved</th><th className="p-4 text-right">Streak</th></tr></thead>
                <tbody>
                  {data?.items.map((entry) => (
                    <tr key={entry.user_id} className="border-b border-[#202020] hover:bg-white/[0.035] transition-colors">
                      <td className="p-4 font-black text-lg">{entry.rank <= 3 ? <Medal className="w-5 h-5 inline mr-2" /> : null}#{entry.rank}</td>
                      <td className="p-4"><div className="font-bold text-[#f7f7f7]">{entry.email}</div><div className="text-[11px] text-[#777]">{entry.scored_submissions} scored submissions</div></td>
                      <td className="p-4 text-right font-black text-xl">{entry.total_points.toFixed(1)}</td>
                      <td className="p-4 text-right font-mono">{entry.average_score.toFixed(1)}/10</td>
                      <td className="p-4 text-right font-mono">{entry.solved_count}</td>
                      <td className="p-4 text-right"><span className="inline-flex items-center gap-1 font-bold"><Flame className="w-4 h-4" />{entry.current_streak}</span></td>
                    </tr>
                  ))}
                  {!data?.items.length && <tr><td colSpan={6} className="p-10 text-center text-[#777]">No scored submissions yet. Submit a solution to enter the board.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
