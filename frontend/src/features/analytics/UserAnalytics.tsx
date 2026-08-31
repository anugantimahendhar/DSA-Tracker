import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../../services/analytics.service';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  BarChart3,
  PieChart as PieIcon,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Award,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const UserAnalytics: React.FC = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['user-analytics'],
    queryFn: analyticsService.getOverview,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  const errorColors: Record<string, string> = {
    Accepted: '#e8e8e8',
    'Wrong Answer': '#efefef',
    'Time Limit Exceeded': '#d0d0d0',
    'Runtime Error': '#D97706',
    'Compilation Error': '#b6b6b6',
  };

  const chartData = analytics?.activity_timeline || [];
  const errorData = analytics?.error_breakdown || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner: Soft peach #151515 */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#151515] border border-[#303030] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111111] border border-[#303030] text-[#ffffff] text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" /> Performance Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f5f5f5] tracking-tight">
            Performance Analytics
          </h1>
          <p className="text-sm text-[#b6b6b6]">
            Granular breakdown of your submission velocity, accuracy rates, and topic strengths.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-4 rounded-xl bg-[#111111] border border-[#303030] text-center shadow-2xs font-mono">
            <span className="text-xs text-[#858585] block font-semibold">Total Runs</span>
            <span className="text-xl font-extrabold text-[#f5f5f5]">{analytics?.total_submissions || 0}</span>
          </div>
          <div className="p-4 rounded-xl bg-[#111111] border border-[#303030] text-center shadow-2xs font-mono">
            <span className="text-xs text-[#858585] block font-semibold">Acceptance</span>
            <span className="text-xl font-extrabold text-[#e8e8e8]">{analytics?.acceptance_rate || 0}%</span>
          </div>
        </div>
      </div>

      {/* Grid: Submission Activity + Error Type Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Submissions Activity Chart */}
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#ffffff]" /> Submission Activity (Timeline)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-[#858585] italic">
                No submissions recorded yet in the activity timeline.
              </div>
            ) : (
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="date" stroke="#858585" fontSize={11} tickLine={false} />
                    <YAxis stroke="#858585" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111111',
                        borderColor: '#303030',
                        borderRadius: '0.75rem',
                        color: '#f5f5f5',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      }}
                    />
                    <Bar dataKey="submissions_count" fill="#ffffff" radius={[4, 4, 0, 0]} name="Submissions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verdict Distribution Pie Chart */}
        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-[#ffffff]" /> Verdict Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {errorData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-[#858585] italic">
                No submissions available for analysis.
              </div>
            ) : (
              <div className="h-72 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={errorData}
                      dataKey="count"
                      nameKey="error_type"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {errorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={errorColors[entry.error_type] || '#858585'} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111111',
                        borderColor: '#303030',
                        borderRadius: '0.75rem',
                        color: '#f5f5f5',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', color: '#b6b6b6' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Strengths and Weaknesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strong Topics */}
        <Card className="border-[#3a3a3a]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-[#e8e8e8]">
              <Award className="w-4 h-4" /> Strong Topics (High Accuracy)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.strong_topics && analytics.strong_topics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {analytics.strong_topics.map((topic) => (
                  <span
                    key={topic}
                    className="px-3 py-1.5 rounded-lg bg-[#171717] border border-[#3a3a3a] text-[#e1e1e1] text-xs font-mono font-bold flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> {topic}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#858585] italic">Solve more problems to identify your strongest topics.</p>
            )}
          </CardContent>
        </Card>

        {/* Growth Areas */}
        <Card className="border-[#444444]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-[#d0d0d0]">
              <AlertTriangle className="w-4 h-4" /> Growth Areas (Needs Practice)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.weak_topics && analytics.weak_topics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {analytics.weak_topics.map((topic) => (
                  <span
                    key={topic}
                    className="px-3 py-1.5 rounded-lg bg-[#1b1b1b] border border-[#444444] text-[#d7d7d7] text-xs font-mono font-bold flex items-center gap-1.5"
                  >
                    <TrendingUp className="w-3.5 h-3.5" /> {topic}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#858585] italic">No high-failure topics detected. Keep practicing!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};