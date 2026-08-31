import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { revisionService } from '../../services/revision.service';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Sparkles,
  AlertCircle,
  Clock,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { RevisionItem } from '../../types';

export const RevisionQueue: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery<RevisionItem[]>({
    queryKey: ['revision-queue'],
    queryFn: revisionService.listQueue,
  });

  const updateMutation = useMutation({
    mutationFn: ({ questionId, status }: { questionId: string; status: string }) =>
      revisionService.updateStatus(questionId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revision-queue'] });
      queryClient.invalidateQueries({ queryKey: ['user-progress-summary'] });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const dueItems = items?.filter((i) => !i.due_date || i.due_date <= today) || [];
  const otherItems = items?.filter((i) => i.due_date && i.due_date > today) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner: Soft peach #151515 */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#151515] border border-[#303030] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111111] border border-[#303030] text-[#ffffff] text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" /> Spaced Repetition Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f5f5f5] tracking-tight">
            Revision & Retention Queue
          </h1>
          <p className="text-sm text-[#b6b6b6]">
            Reinforce tricky algorithmic patterns before your memory fades.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-4 rounded-xl bg-[#111111] border border-[#303030] text-center shadow-2xs font-mono">
            <span className="text-xs text-[#858585] block font-semibold">Due Today</span>
            <span className="text-xl font-extrabold text-[#ffffff]">{dueItems.length}</span>
          </div>
          <div className="p-4 rounded-xl bg-[#111111] border border-[#303030] text-center shadow-2xs font-mono">
            <span className="text-xs text-[#858585] block font-semibold">Total Queue</span>
            <span className="text-xl font-extrabold text-[#f5f5f5]">{items?.length || 0}</span>
          </div>
        </div>
      </div>

      {items && items.length === 0 ? (
        <EmptyState
          title="Your revision queue is clear!"
          description="Problems you solve or struggle with can be added to your revision queue for spaced review."
          actionText="Browse Problems"
          onAction={() => navigate('/problems')}
          icon={<BookOpen className="w-10 h-10 text-[#ffffff]" />}
        />
      ) : (
        <div className="space-y-6">
          {/* Due Today Section */}
          {dueItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-[#f5f5f5] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#ffffff]" /> Due for Revision Today ({dueItems.length})
              </h3>
              <div className="space-y-3">
                {dueItems.map((item: RevisionItem) => {
                  const struggled = (item.failed_attempts_count || 0) >= 2;
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-[#111111] border-2 border-[#ffffff]/40 hover:bg-[#181818] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs text-[#858585] font-semibold">{item.question_code}</span>
                          <h4 className="text-sm font-bold text-[#f5f5f5]">{item.question_title}</h4>
                          <Badge variant="difficulty" difficulty={item.difficulty} size="sm" />
                          <span className="text-xs font-mono bg-[#1d1d1d] text-[#ffffff] px-2 py-0.5 rounded border border-[#151515] font-semibold">
                            {item.topic}
                          </span>
                          {struggled && (
                            <span className="text-[10px] bg-[#1a1a1a] text-[#efefef] px-2 py-0.5 rounded font-bold border border-[#494949] flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Struggled (2+ Fails)
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#b6b6b6] flex items-center gap-4">
                          <span>Status: <strong className="text-[#f5f5f5]">{item.status}</strong></span>
                          <span>Failed attempts: {item.failed_attempts_count || 0}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <select
                          value={item.status}
                          onChange={(e) =>
                            updateMutation.mutate({ questionId: item.question_id, status: e.target.value })
                          }
                          className="bg-[#080808] border border-[#303030] text-[#f5f5f5] text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-[#bfbfbf]"
                        >
                          <option value="Needs Revision">Needs Revision</option>
                          <option value="Comfortable">Comfortable</option>
                          <option value="Mastered">Mastered</option>
                        </select>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(`/problems/${item.question_id}`)}
                          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                        >
                          Solve Now
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Other Queue Items */}
          {otherItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-[#f5f5f5] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#858585]" /> Upcoming Reviews ({otherItems.length})
              </h3>
              <div className="space-y-3">
                {otherItems.map((item: RevisionItem) => {
                  const struggled = (item.failed_attempts_count || 0) >= 2;
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-[#111111] border border-[#303030] hover:bg-[#181818] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs text-[#858585] font-semibold">{item.question_code}</span>
                          <h4 className="text-sm font-bold text-[#f5f5f5]">{item.question_title}</h4>
                          <Badge variant="difficulty" difficulty={item.difficulty} size="sm" />
                          <span className="text-xs font-mono bg-[#1d1d1d] text-[#ffffff] px-2 py-0.5 rounded border border-[#151515] font-semibold">
                            {item.topic}
                          </span>
                          {struggled && (
                            <span className="text-[10px] bg-[#1a1a1a] text-[#efefef] px-2 py-0.5 rounded font-bold border border-[#494949] flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Struggled
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#858585]">
                          Status: <strong className="text-[#f5f5f5]">{item.status}</strong> • Due: {item.due_date || 'Soon'}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <select
                          value={item.status}
                          onChange={(e) =>
                            updateMutation.mutate({ questionId: item.question_id, status: e.target.value })
                          }
                          className="bg-[#080808] border border-[#303030] text-[#f5f5f5] text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-[#bfbfbf]"
                        >
                          <option value="Needs Revision">Needs Revision</option>
                          <option value="Comfortable">Comfortable</option>
                          <option value="Mastered">Mastered</option>
                        </select>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/problems/${item.question_id}`)}
                        >
                          Open
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};