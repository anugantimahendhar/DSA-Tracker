import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { questionsService } from '../../services/questions.service';
import { bookmarksService } from '../../services/bookmarks.service';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Bookmark, ArrowRight, Trash2 } from 'lucide-react';
import { QuestionListItem } from '../../types';

export const BookmarkedProblems: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: bookmarks, isLoading } = useQuery<QuestionListItem[]>({
    queryKey: ['bookmarked-problems'],
    queryFn: () => questionsService.listQuestions({ bookmarked_only: true }),
  });

  const removeBookmarkMutation = useMutation({
    mutationFn: (questionId: string) => bookmarksService.toggle(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarked-problems'] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['user-progress-summary'] });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner: Soft peach #151515 */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#151515] border border-[#303030] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111111] border border-[#303030] text-[#d5d5d5] text-xs font-bold shadow-2xs">
            <Bookmark className="w-3.5 h-3.5 fill-[#d5d5d5]" /> Starred Practice List
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f5f5f5] tracking-tight">
            Bookmarked Problems
          </h1>
          <p className="text-sm text-[#b6b6b6]">
            Quick access to the algorithmic problems you marked for deep practice.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#111111] border border-[#303030] text-center shadow-2xs font-mono">
          <span className="text-xs text-[#858585] block font-semibold">Total Saved</span>
          <span className="text-xl font-extrabold text-[#d5d5d5]">{bookmarks?.length || 0}</span>
        </div>
      </div>

      {bookmarks && bookmarks.length === 0 ? (
        <EmptyState
          title="No bookmarked problems yet"
          description="Click the bookmark star icon on any problem in the explorer or workspace to save it to this list."
          actionText="Explore Problems"
          onAction={() => navigate('/problems')}
          icon={<Bookmark className="w-10 h-10 text-[#d5d5d5]" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookmarks?.map((q: QuestionListItem) => (
            <div
              key={q.id}
              onClick={() => navigate(`/problems/${q.id}`)}
              className="p-5 rounded-2xl bg-[#111111] border border-[#303030] hover:bg-[#181818] hover:border-[#ffffff] transition-all cursor-pointer flex flex-col justify-between space-y-4 group shadow-2xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#858585] font-semibold">{q.code}</span>
                  <Badge variant="difficulty" difficulty={q.difficulty} size="sm" />
                </div>
                <h3 className="text-base font-bold text-[#f5f5f5] group-hover:text-[#ffffff] transition-colors">
                  {q.title}
                </h3>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#303030]">
                <span className="text-xs font-mono bg-[#1d1d1d] text-[#ffffff] px-2.5 py-0.5 rounded border border-[#151515] font-semibold">
                  {q.topic}
                </span>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => removeBookmarkMutation.mutate(q.id)}
                    className="p-1.5 rounded-lg text-[#858585] hover:text-[#efefef] hover:bg-[#1a1a1a] transition-colors"
                    title="Remove from bookmarks"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/problems/${q.id}`)}>
                    <ArrowRight className="w-4 h-4 text-[#ffffff]" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};