import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import { aiService } from '../../services/ai.service';
import { TOPICS, DIFFICULTIES } from '../../utils/constants';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Shield,
  Plus,
  Trash2,
  FileCode2,
  Database,
  Users,
  Eye,
  EyeOff,
  AlertTriangle,
  Sparkles,
  BrainCircuit,
} from 'lucide-react';
import { QuestionDetail, TestCase } from '../../types';

export const AdminDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTestCasesModalOpen, setIsTestCasesModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionDetail | null>(null);

  // Form State for new question
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [constraints, setConstraints] = useState('');
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [topic, setTopic] = useState<string>('Arrays');
  const [pattern, setPattern] = useState<string>('');
  const [companyTags, setCompanyTags] = useState<string>('Google, Amazon');
  const [formError, setFormError] = useState<string | null>(null);
  const [aiSuggestedTests, setAiSuggestedTests] = useState<Partial<TestCase>[]>([]);

  // Form State for adding test case
  const [tcInput, setTcInput] = useState('');
  const [tcOutput, setTcOutput] = useState('');
  const [tcIsHidden, setTcIsHidden] = useState(false);

  // Fetch admin stats
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminService.getStats,
  });

  // Fetch all admin questions
  const { data: questions, isLoading: isQuestionsLoading } = useQuery<QuestionDetail[]>({
    queryKey: ['admin-questions'],
    queryFn: adminService.listAllQuestions,
  });

  // Create Question Mutation
  const createMutation = useMutation({
    mutationFn: async (newQ: any) => {
      const created = await adminService.createQuestion(newQ);
      const verifiedSuggestions = aiSuggestedTests.filter((tc) => tc.input && tc.expected_output && !String(tc.input).toLowerCase().includes('sample input') && !String(tc.input).toLowerCase().includes('edge-case input'));
      for (const tc of verifiedSuggestions) {
        await adminService.createTestCase(created.id, tc);
      }
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.detail || 'Failed to create question.');
    },
  });

  const aiGenerateMutation = useMutation({
    mutationFn: (prompt: string) => aiService.generateQuestion(prompt),
    onSuccess: (draft) => {
      setCode(draft.code);
      setTitle(draft.title);
      setDescription(draft.description);
      setConstraints(draft.constraints);
      setExplanation(draft.explanation);
      setDifficulty(draft.difficulty);
      setTopic(draft.topic);
      setPattern(draft.pattern || '');
      setCompanyTags(draft.company_tags.join(', '));
      setAiSuggestedTests(draft.suggested_test_cases || []);
      setFormError(null);
    },
    onError: (err: any) => setFormError(err.response?.data?.detail || err.message || 'AI generation failed.'),
  });

  // Publish / Draft Toggle Mutation
  const publishMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'Published' | 'Draft' }) =>
      adminService.updateQuestion(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });

  // Delete Question Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });

  // Test Case Mutations
  const addTestCaseMutation = useMutation({
    mutationFn: ({ questionId, tc }: { questionId: string; tc: Partial<TestCase> }) =>
      adminService.createTestCase(questionId, tc),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testcases', selectedQuestion?.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
      setTcInput('');
      setTcOutput('');
    },
  });

  const deleteTestCaseMutation = useMutation({
    mutationFn: (testCaseId: string) => adminService.deleteTestCase(testCaseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testcases', selectedQuestion?.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
    },
  });

  // Fetch Test Cases for selected question
  const { data: testCases } = useQuery<TestCase[]>({
    queryKey: ['admin-testcases', selectedQuestion?.id],
    queryFn: () => adminService.listTestCases(selectedQuestion!.id),
    enabled: !!selectedQuestion && isTestCasesModalOpen,
  });

  const resetForm = () => {
    setCode('');
    setTitle('');
    setDescription('');
    setConstraints('');
    setExplanation('');
    setDifficulty('Easy');
    setTopic('Arrays');
    setPattern('');
    setCompanyTags('Google, Amazon');
    setFormError(null);
    setAiSuggestedTests([]);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const tagsArray = companyTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    createMutation.mutate({
      code: code.toUpperCase().trim(),
      title: title.trim(),
      description: description.trim(),
      constraints: constraints.trim(),
      explanation: explanation.trim(),
      difficulty,
      topic,
      pattern: pattern.trim() || undefined,
      company_tags: tagsArray,
      examples: [
        {
          input: 'Sample Input',
          output: 'Sample Output',
          explanation: 'Sample Explanation',
        },
      ],
      starter_templates: {
        python: '# Write solution here\n',
        javascript: '// Write solution here\n',
        cpp: '// Write solution here\n',
        java: '// Write solution here\n',
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header: Soft peach #151515 */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#151515] border border-[#303030] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111111] border border-[#303030] text-[#ffffff] text-xs font-bold shadow-2xs">
            <Shield className="w-3.5 h-3.5" /> Staff Operations & Content Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f5f5f5] tracking-tight">
            Administrator Console
          </h1>
          <p className="text-sm text-[#b6b6b6]">
            Manage algorithm problems, curate visible and hidden test suites, and monitor usage metrics.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create New Problem
        </Button>
      </div>

      {/* Admin Metric Cards: White #111111 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-[#858585] font-semibold">Total Problems</span>
              <div className="text-2xl font-extrabold text-[#f5f5f5] font-mono mt-1">
                {stats?.total_questions || 0}
              </div>
              <span className="text-[11px] text-[#e8e8e8] font-bold">
                {stats?.published_questions || 0} Published
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#1d1d1d] border border-[#151515] flex items-center justify-center text-[#ffffff]">
              <Database className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-[#858585] font-semibold">Total Submissions</span>
              <div className="text-2xl font-extrabold text-[#f5f5f5] font-mono mt-1">
                {stats?.total_submissions || 0}
              </div>
              <span className="text-[11px] text-[#d0d0d0] font-bold">Execution Runs</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#1b1b1b] border border-[#444444] flex items-center justify-center text-[#d0d0d0]">
              <FileCode2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-[#858585] font-semibold">Registered Users</span>
              <div className="text-2xl font-extrabold text-[#f5f5f5] font-mono mt-1">
                {stats?.total_users || 0}
              </div>
              <span className="text-[11px] text-[#d5d5d5] font-bold">Active Profiles</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#1b1b1b] border border-[#444444] flex items-center justify-center text-[#d5d5d5]">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Questions Table */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-base">Question Bank Management</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isQuestionsLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#b6b6b6]">
                <thead className="bg-[#151515]/40 text-xs uppercase font-mono text-[#f5f5f5] font-bold border-b border-[#303030]">
                  <tr>
                    <th className="px-5 py-3.5">Code</th>
                    <th className="px-5 py-3.5">Title</th>
                    <th className="px-5 py-3.5">Topic</th>
                    <th className="px-5 py-3.5">Difficulty</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#303030] font-medium">
                  {questions?.map((q: QuestionDetail) => (
                    <tr key={q.id} className="hover:bg-[#181818] transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs text-[#858585] font-semibold">{q.code}</td>
                      <td className="px-5 py-3.5 font-bold text-[#f5f5f5]">{q.title}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-mono bg-[#1d1d1d] text-[#ffffff] px-2 py-0.5 rounded border border-[#151515] font-semibold">
                          {q.topic}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant="difficulty" difficulty={q.difficulty} size="sm" />
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() =>
                            publishMutation.mutate({
                              id: q.id,
                              status: q.status === 'Published' ? 'Draft' : 'Published',
                            })
                          }
                          className={`px-2.5 py-0.5 rounded text-xs font-bold border transition-colors ${
                            q.status === 'Published'
                              ? 'bg-[#171717] text-[#e8e8e8] border-[#3a3a3a]'
                              : 'bg-[#F5F5F4] text-[#57534E] border-[#D6D3D1]'
                          }`}
                        >
                          {q.status}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedQuestion(q);
                              setIsTestCasesModalOpen(true);
                            }}
                          >
                            Manage Tests
                          </Button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${q.title}"?`)) {
                                deleteMutation.mutate(q.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-[#858585] hover:text-[#efefef] hover:bg-[#1a1a1a] transition-colors"
                            title="Delete Problem"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Question Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Algorithm Problem"
        size="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#494949] text-[#efefef] text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Problem Code (e.g. TWO-SUM)"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="UNIQUE-CODE"
            />
            <div className="space-y-2">
              <Input
                label="Problem Title / Question"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Find the longest palindromic substring"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full ai-generate-button"
                disabled={title.trim().length < 2}
                isLoading={aiGenerateMutation.isPending}
                onClick={() => aiGenerateMutation.mutate(title.trim())}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                AI Summary — Fill Complete Question
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#f5f5f5] mb-1.5">Topic</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-[#111111] border border-[#303030] text-[#f5f5f5] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#bfbfbf]"
              >
                {TOPICS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#f5f5f5] mb-1.5">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-[#111111] border border-[#303030] text-[#f5f5f5] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#bfbfbf]"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Pattern (Optional)"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="e.g. Hashing, Two Pointers"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#f5f5f5] mb-1.5">Problem Description (Markdown)</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed problem statement..."
              className="w-full bg-[#111111] border border-[#303030] text-[#f5f5f5] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#bfbfbf]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#f5f5f5] mb-1.5">Constraints</label>
              <textarea
                rows={2}
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                placeholder="1 <= nums.length <= 10^4..."
                className="w-full bg-[#111111] border border-[#303030] text-[#f5f5f5] rounded-lg p-2.5 text-xs font-mono focus:ring-2 focus:ring-[#bfbfbf]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#f5f5f5] mb-1.5">Solution Analysis</label>
              <textarea
                rows={2}
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Optimal time/space complexity analysis..."
                className="w-full bg-[#111111] border border-[#303030] text-[#f5f5f5] rounded-lg p-2.5 text-xs font-mono focus:ring-2 focus:ring-[#bfbfbf]"
              />
            </div>
          </div>

          <Input
            label="Company Tags (comma separated)"
            value={companyTags}
            onChange={(e) => setCompanyTags(e.target.value)}
            placeholder="Google, Amazon, Meta, Apple"
          />

          {aiSuggestedTests.length > 0 && (
            <div className="depth-inset rounded-xl p-3 text-xs text-[#aaa] flex items-start gap-2">
              <BrainCircuit className="w-4 h-4 mt-0.5 text-white" />
              <span>AI prepared {aiSuggestedTests.length} suggested test cases. Real generated cases are added automatically when the draft is created; placeholder fallback cases are intentionally skipped for safety.</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-[#303030]">
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={createMutation.isPending}>
              Create Problem
            </Button>
          </div>
        </form>
      </Modal>

      {/* Manage Test Cases Modal */}
      {selectedQuestion && (
        <Modal
          isOpen={isTestCasesModalOpen}
          onClose={() => setIsTestCasesModalOpen(false)}
          title={`Test Suite: ${selectedQuestion.title}`}
          size="lg"
        >
          <div className="space-y-6">
            {/* Existing Test Cases List */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase font-bold text-[#f5f5f5]">Configured Test Cases</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {testCases?.map((tc: TestCase, idx: number) => (
                  <div
                    key={tc.id || idx}
                    className="p-3 rounded-xl bg-[#080808] border border-[#303030] flex items-center justify-between text-xs font-mono shadow-2xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#f5f5f5]">Case {idx + 1}</span>
                        {tc.is_hidden ? (
                          <span className="text-[10px] bg-[#1b1b1b] text-[#d7d7d7] px-1.5 py-0.5 rounded border border-[#444444] flex items-center gap-1">
                            <EyeOff className="w-3 h-3" /> Hidden
                          </span>
                        ) : (
                          <span className="text-[10px] bg-[#171717] text-[#e8e8e8] px-1.5 py-0.5 rounded border border-[#3a3a3a] flex items-center gap-1">
                            <Eye className="w-3 h-3" /> Visible
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#b6b6b6]">
                        Input: <span className="text-[#f5f5f5]">{tc.input}</span> | Expected:{' '}
                        <span className="text-[#e8e8e8] font-bold">{tc.expected_output}</span>
                      </div>
                    </div>

                    {tc.id && (
                      <button
                        onClick={() => deleteTestCaseMutation.mutate(tc.id!)}
                        className="p-1 rounded text-[#858585] hover:text-[#efefef] hover:bg-[#1a1a1a]"
                        title="Delete Test Case"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Add Test Case Form */}
            <div className="p-4 rounded-xl bg-[#080808] border border-[#303030] space-y-3">
              <h4 className="text-xs font-mono uppercase font-bold text-[#f5f5f5]">Add New Test Case</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#f5f5f5] mb-1">Standard Input (stdin)</label>
                  <textarea
                    rows={2}
                    value={tcInput}
                    onChange={(e) => setTcInput(e.target.value)}
                    placeholder="Input lines..."
                    className="w-full bg-[#111111] border border-[#303030] text-[#f5f5f5] rounded-lg p-2 text-xs font-mono focus:ring-1 focus:ring-[#bfbfbf]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#f5f5f5] mb-1">Expected Output (stdout)</label>
                  <textarea
                    rows={2}
                    value={tcOutput}
                    onChange={(e) => setTcOutput(e.target.value)}
                    placeholder="Expected output..."
                    className="w-full bg-[#111111] border border-[#303030] text-[#f5f5f5] rounded-lg p-2 text-xs font-mono focus:ring-1 focus:ring-[#bfbfbf]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs text-[#f5f5f5] cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={tcIsHidden}
                    onChange={(e) => setTcIsHidden(e.target.checked)}
                    className="rounded border-[#303030] text-[#ffffff] focus:ring-[#bfbfbf]"
                  />
                  <span>Hidden Test Case (Used for evaluation, never exposed to user)</span>
                </label>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (!tcInput.trim() || !tcOutput.trim()) return;
                    addTestCaseMutation.mutate({
                      questionId: selectedQuestion.id,
                      tc: {
                        input: tcInput.trim(),
                        expected_output: tcOutput.trim(),
                        is_hidden: tcIsHidden,
                        order_index: (testCases?.length || 0) + 1,
                      },
                    });
                  }}
                  isLoading={addTestCaseMutation.isPending}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Test Case
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};