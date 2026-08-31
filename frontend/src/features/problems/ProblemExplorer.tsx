import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { questionsService } from '../../services/questions.service';
import { bookmarksService } from '../../services/bookmarks.service';
import { useAuth } from '../auth/useAuth';
import { TOPICS, DIFFICULTIES } from '../../utils/constants';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Search,
  CheckCircle2,
  Clock,
  Circle,
  Bookmark,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const ProblemExplorer: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const difficultyParam = searchParams.get('difficulty') || '';
  const topicParam = searchParams.get('topic') || '';
  const statusParam = searchParams.get('status') || '';
  const searchParam = searchParams.get('search') || '';
  const bookmarkedParam = searchParams.get('bookmarked') === 'true';

  const [searchInput, setSearchInput] = useState(searchParam);

  const { data: questions, isLoading, isError, refetch } = useQuery({
    queryKey: ['questions', { difficultyParam, topicParam, statusParam, searchParam, bookmarkedParam }],
    queryFn: () =>
      questionsService.listQuestions({
        difficulty: difficultyParam || undefined,
        topic: topicParam || undefined,
        user_status: statusParam || undefined,
        search: searchParam || undefined,
        bookmarked_only: bookmarkedParam,
      }),
  });

  const toggleBookmarkMutation = useMutation({
    mutationFn: (id: string) => bookmarksService.toggle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['user-progress-summary'] });
    },
  });

  const handleFilterChange = (key: string, value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    setSearchParams(nextParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange('search', searchInput.trim());
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = !!(difficultyParam || topicParam || statusParam || searchParam || bookmarkedParam);

  const getStatusIcon = (status?: string) => {
    if (status === 'SOLVED') return <CheckCircle2 className="w-4 h-4 text-[#e8e8e8]" />;
    if (status === 'ATTEMPTED') return <Clock className="w-4 h-4 text-[#d0d0d0]" />;
    return <Circle className="w-4 h-4 text-[#D6D3D1]" />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Hero Header: Soft peach #151515 */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#151515] border border-[#303030] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111111] border border-[#303030] text-[#ffffff] text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" /> Curated Algorithm Practice
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#f5f5f5]">
            Problem Explorer
          </h1>
          <p className="text-sm text-[#b6b6b6] max-w-xl">
            Browse, filter, and solve algorithm challenges with real-time multi-language sandbox execution.
          </p>
        </div>

        {/* Quick Difficulty Progress Pills */}
        <div className="flex items-center gap-2">
          {DIFFICULTIES.map((diff) => {
            const isActive = difficultyParam === diff;
            return (
              <button
                key={diff}
                onClick={() => handleFilterChange('difficulty', isActive ? '' : diff)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono border transition-all shadow-2xs ${
                  isActive
                    ? diff === 'Easy'
                      ? 'bg-[#171717] text-[#e8e8e8] border-[#3a3a3a] ring-2 ring-[#3a3a3a]'
                      : diff === 'Medium'
                      ? 'bg-[#1b1b1b] text-[#d0d0d0] border-[#444444] ring-2 ring-[#444444]'
                      : 'bg-[#1a1a1a] text-[#f0f0f0] border-[#494949] ring-2 ring-[#494949]'
                    : 'bg-[#111111] text-[#b6b6b6] border-[#303030] hover:border-[#ffffff] hover:text-[#ffffff]'
                }`}
              >
                {diff}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="lg:col-span-5">
          <Input
            placeholder="Search problems by title, keywords..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-[#858585]" />}
          />
        </form>

        {/* Topic Selector */}
        <div className="lg:col-span-3">
          <select
            value={topicParam}
            onChange={(e) => handleFilterChange('topic', e.target.value)}
            className="w-full bg-[#111111] border border-[#303030] text-[#f5f5f5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#bfbfbf] focus:border-[#bfbfbf] transition-colors shadow-2xs font-medium"
          >
            <option value="">All Topics ({TOPICS.length})</option>
            {TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter (if logged in) */}
        {isAuthenticated && (
          <div className="lg:col-span-2">
            <select
              value={statusParam}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full bg-[#111111] border border-[#303030] text-[#f5f5f5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#bfbfbf] focus:border-[#bfbfbf] transition-colors shadow-2xs font-medium"
            >
              <option value="">All Statuses</option>
              <option value="SOLVED">Solved</option>
              <option value="ATTEMPTED">Attempted</option>
              <option value="NOT_STARTED">Not Started</option>
            </select>
          </div>
        )}

        {/* Bookmarked Filter */}
        <div className={isAuthenticated ? 'lg:col-span-2 flex items-center gap-2' : 'lg:col-span-4 flex items-center gap-2'}>
          {isAuthenticated && (
            <button
              onClick={() => handleFilterChange('bookmarked', bookmarkedParam ? '' : 'true')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 transition-colors shadow-2xs ${
                bookmarkedParam
                  ? 'bg-[#1b1b1b] border-[#444444] text-[#d5d5d5]'
                  : 'bg-[#111111] border-[#303030] text-[#b6b6b6] hover:bg-[#1d1d1d] hover:text-[#ffffff]'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${bookmarkedParam ? 'fill-[#d5d5d5] text-[#d5d5d5]' : ''}`} />
              <span>Saved</span>
            </button>
          )}

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Problem Table / Grid */}
      <div className="bg-[#111111] border border-[#303030] rounded-2xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-12 text-center">
            <p className="text-sm text-[#efefef] mb-4">Unable to fetch problems from the service.</p>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Retry Connection
            </Button>
          </div>
        ) : questions && questions.length === 0 ? (
          <EmptyState
            title="No questions found"
            description="Try adjusting your filters or search keywords to find what you're looking for."
            actionText="Clear All Filters"
            onAction={clearAllFilters}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#b6b6b6]">
              <thead className="bg-[#151515]/40 text-xs uppercase font-mono text-[#f5f5f5] font-bold border-b border-[#303030]">
                <tr>
                  <th scope="col" className="px-4 py-3.5 w-12 text-center">Status</th>
                  <th scope="col" className="px-4 py-3.5">Title</th>
                  <th scope="col" className="px-4 py-3.5 hidden md:table-cell">Topic</th>
                  <th scope="col" className="px-4 py-3.5">Difficulty</th>
                  <th scope="col" className="px-4 py-3.5 hidden lg:table-cell">Companies</th>
                  <th scope="col" className="px-4 py-3.5 w-24 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#303030] font-medium">
                {questions?.map((q) => (
                  <tr
                    key={q.id}
                    className="hover:bg-[#181818] transition-colors group cursor-pointer"
                    onClick={() => navigate(`/problems/${q.id}`)}
                  >
                    {/* Status */}
                    <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center justify-center" title={q.user_status}>
                        {getStatusIcon(q.user_status)}
                      </div>
                    </td>

                    {/* Title & Code */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-[#858585] font-semibold">{q.code}</span>
                        <span className="text-[#f5f5f5] group-hover:text-[#ffffff] transition-colors font-bold">
                          {q.title}
                        </span>
                      </div>
                    </td>

                    {/* Topic */}
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-xs text-[#ffffff] bg-[#1d1d1d] px-2.5 py-0.5 rounded-md border border-[#151515] font-mono font-semibold">
                        {q.topic}
                      </span>
                    </td>

                    {/* Difficulty */}
                    <td className="px-4 py-3.5">
                      <Badge variant="difficulty" difficulty={q.difficulty} size="sm" />
                    </td>

                    {/* Company Tags */}
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {q.company_tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-[10px] text-[#b6b6b6] bg-[#151515]/60 px-1.5 py-0.5 rounded border border-[#303030]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Actions: Bookmark & Solve */}
                    <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {isAuthenticated && (
                          <button
                            onClick={() => toggleBookmarkMutation.mutate(q.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              q.is_bookmarked
                                ? 'text-[#d5d5d5] bg-[#1b1b1b]'
                                : 'text-[#858585] hover:text-[#d5d5d5] hover:bg-[#1b1b1b]'
                            }`}
                            title={q.is_bookmarked ? 'Remove Bookmark' : 'Bookmark Problem'}
                          >
                            <Bookmark className={`w-4 h-4 ${q.is_bookmarked ? 'fill-[#d5d5d5]' : ''}`} />
                          </button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/problems/${q.id}`)}
                          className="group-hover:bg-[#ffffff] group-hover:text-white group-hover:border-[#ffffff]"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};