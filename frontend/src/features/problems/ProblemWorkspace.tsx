import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import { questionsService } from '../../services/questions.service';
import { compilerService } from '../../services/compiler.service';
import { bookmarksService } from '../../services/bookmarks.service';
import { notesService } from '../../services/notes.service';
import { submissionsService } from '../../services/submissions.service';
import { revisionService } from '../../services/revision.service';
import { useAuth } from '../auth/useAuth';
import { LANGUAGES } from '../../utils/constants';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Play,
  Send,
  Bookmark,
  RotateCcw,
  CheckCircle2,
  XCircle,
  FileText,
  History,
  Lightbulb,
  Lock,
  Sparkles,
  Save,
  ChevronLeft,
} from 'lucide-react';
import { CodeRunResponse, CodeSubmitResponse } from '../../types';

export const ProblemWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'description' | 'notes' | 'submissions' | 'solution'>('description');
  const [selectedLanguage, setSelectedLanguage] = useState<'python' | 'javascript' | 'cpp' | 'java'>('python');
  const [editorCode, setEditorCode] = useState<string>('');
  const [draftStatus, setDraftStatus] = useState<string>('Saved');
  const [selectedTestCaseIdx, setSelectedTestCaseIdx] = useState<number>(0);
  const [runResult, setRunResult] = useState<CodeRunResponse | null>(null);
  const [submitResult, setSubmitResult] = useState<CodeSubmitResponse | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState<string>('');
  const [noteSaveStatus, setNoteSaveStatus] = useState<string>('');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch Question details
  const { data: question, isLoading } = useQuery({
    queryKey: ['question-detail', id],
    queryFn: () => questionsService.getQuestion(id!),
    enabled: !!id,
  });

  // Fetch Submissions history
  const { data: submissions, refetch: refetchSubmissions } = useQuery({
    queryKey: ['question-submissions', id],
    queryFn: () => submissionsService.listForQuestion(id!),
    enabled: !!id && isAuthenticated,
  });

  // Fetch Note
  const { data: noteData } = useQuery({
    queryKey: ['question-note', id],
    queryFn: () => notesService.getNote(id!),
    enabled: !!id && isAuthenticated,
  });

  useEffect(() => {
    if (noteData) setNoteContent(noteData.content || '');
  }, [noteData]);

  // Load starter code or draft
  useEffect(() => {
    if (!question) return;

    const loadDraftOrTemplate = async () => {
      if (isAuthenticated && id) {
        try {
          const draft = await compilerService.getDraft(id, selectedLanguage);
          if (draft.code) {
            setEditorCode(draft.code);
            return;
          }
        } catch {
          // fallback to template
        }
      }
      // Load starter template
      const template = question.starter_templates?.[selectedLanguage] || '# Write your solution here\n';
      setEditorCode(template);
    };

    loadDraftOrTemplate();
  }, [question, selectedLanguage, id, isAuthenticated]);

  // Autosave Draft debounced (1.5s)
  const handleEditorChange = (value: string | undefined) => {
    const newCode = value || '';
    setEditorCode(newCode);
    setDraftStatus('Editing...');

    if (isAuthenticated && id) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await compilerService.saveDraft(id, selectedLanguage, newCode);
          setDraftStatus('Draft saved');
        } catch {
          setDraftStatus('Autosave paused');
        }
      }, 1500);
    }
  };

  // Run visible tests
  const runMutation = useMutation({
    mutationFn: () => compilerService.runCode(id!, selectedLanguage, editorCode),
    onSuccess: (data) => {
      setRunResult(data);
      queryClient.invalidateQueries({ queryKey: ['question-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['user-progress-summary'] });
      queryClient.invalidateQueries({ queryKey: ['ai-leaderboard'] });
    },
  });

  // Submit code
  const submitMutation = useMutation({
    mutationFn: () => compilerService.submitCode(id!, selectedLanguage, editorCode),
    onSuccess: (data) => {
      setSubmitResult(data);
      setIsSubmitModalOpen(true);
      refetchSubmissions();
      queryClient.invalidateQueries({ queryKey: ['question-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['user-progress-summary'] });
      queryClient.invalidateQueries({ queryKey: ['ai-leaderboard'] });

      if (data.status === 'Accepted') {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ffffff', '#d8d8d8', '#e8e8e8', '#bfbfbf'],
        });
      }
    },
  });

  // Toggle Bookmark
  const bookmarkMutation = useMutation({
    mutationFn: () => bookmarksService.toggle(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });

  // Save Note
  const saveNote = async () => {
    if (!id || !isAuthenticated) return;
    setNoteSaveStatus('Saving...');
    try {
      await notesService.saveNote(id, noteContent);
      setNoteSaveStatus('Saved!');
      setTimeout(() => setNoteSaveStatus(''), 2000);
    } catch {
      setNoteSaveStatus('Error saving');
    }
  };

  // Mark for revision
  const setRevisionMutation = useMutation({
    mutationFn: (status: string) => revisionService.updateStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-progress-summary'] });
    },
  });

  const handleRunClick = () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    runMutation.mutate();
  };

  const handleSubmitClick = () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    submitMutation.mutate();
  };

  const handleResetCode = () => {
    if (!question) return;
    const template = question.starter_templates?.[selectedLanguage] || '';
    setEditorCode(template);
    handleEditorChange(template);
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#080808]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="p-12 text-center text-[#b6b6b6] bg-[#080808]">
        <p>Question not found.</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/problems')}>
          Back to Problems
        </Button>
      </div>
    );
  }

  const currentLangMeta = LANGUAGES.find((l) => l.id === selectedLanguage) || LANGUAGES[0];
  const isSolved = question.user_status === 'SOLVED';

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-[#080808] overflow-hidden">
      {/* Top Problem Header Bar */}
      <div className="h-14 px-4 bg-[#111111] border-b border-[#303030] flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/problems')}
            className="p-1.5 rounded-lg text-[#b6b6b6] hover:text-[#f5f5f5] hover:bg-[#1d1d1d] transition-colors"
            title="Back to Problems"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-mono text-xs text-[#858585] font-bold">{question.code}</span>
          <h2 className="text-base font-bold text-[#f5f5f5] truncate max-w-[200px] sm:max-w-md">{question.title}</h2>
          <Badge variant="difficulty" difficulty={question.difficulty} size="sm" />
          {isSolved && (
            <span className="flex items-center gap-1 text-xs text-[#e1e1e1] bg-[#171717] px-2 py-0.5 rounded-md border border-[#3a3a3a] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Solved
            </span>
          )}
        </div>

        {/* Right Workspace Actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <>
              <button
                onClick={() => bookmarkMutation.mutate()}
                className={`p-2 rounded-lg border transition-colors shadow-2xs ${
                  question.is_bookmarked
                    ? 'bg-[#1b1b1b] border-[#444444] text-[#d5d5d5]'
                    : 'bg-[#111111] border-[#303030] text-[#b6b6b6] hover:bg-[#1d1d1d] hover:text-[#ffffff]'
                }`}
                title="Bookmark Problem"
              >
                <Bookmark className={`w-4 h-4 ${question.is_bookmarked ? 'fill-[#d5d5d5]' : ''}`} />
              </button>

              <button
                onClick={() => setRevisionMutation.mutate('Needs Revision')}
                className="px-2.5 py-1.5 rounded-lg bg-[#111111] border border-[#303030] text-[#b6b6b6] hover:text-[#ffffff] hover:bg-[#1d1d1d] text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                title="Add to Revision Queue"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Revise</span>
              </button>
            </>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={handleRunClick}
            isLoading={runMutation.isPending}
            leftIcon={<Play className="w-3.5 h-3.5 text-[#ffffff]" />}
          >
            Run Tests
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmitClick}
            isLoading={submitMutation.isPending}
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            Submit
          </Button>
        </div>
      </div>

      {/* Main Workspace: Split Pane */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Panel: Description, Notes, Submissions, Solution */}
        <div className="lg:col-span-5 border-r border-[#303030] flex flex-col h-full bg-[#FFFDFB] overflow-hidden">
          {/* Panel Tabs */}
          <div className="flex border-b border-[#303030] bg-[#111111] px-2 shrink-0">
            <button
              onClick={() => setActiveTab('description')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'description'
                  ? 'border-[#ffffff] text-[#ffffff] bg-[#1d1d1d]/60'
                  : 'border-transparent text-[#858585] hover:text-[#f5f5f5] hover:bg-[#181818]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Description
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'notes'
                  ? 'border-[#ffffff] text-[#ffffff] bg-[#1d1d1d]/60'
                  : 'border-transparent text-[#858585] hover:text-[#f5f5f5] hover:bg-[#181818]'
              }`}
            >
              <Save className="w-3.5 h-3.5" /> Notes
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'submissions'
                  ? 'border-[#ffffff] text-[#ffffff] bg-[#1d1d1d]/60'
                  : 'border-transparent text-[#858585] hover:text-[#f5f5f5] hover:bg-[#181818]'
              }`}
            >
              <History className="w-3.5 h-3.5" /> Submissions
            </button>
            <button
              onClick={() => setActiveTab('solution')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'solution'
                  ? 'border-[#ffffff] text-[#ffffff] bg-[#1d1d1d]/60'
                  : 'border-transparent text-[#858585] hover:text-[#f5f5f5] hover:bg-[#181818]'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" /> Solution
            </button>
          </div>

          {/* Left Panel Content */}
          <div className="flex-1 p-5 overflow-y-auto space-y-6 text-sm text-[#b6b6b6]">
            {activeTab === 'description' && (
              <>
                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono bg-[#1d1d1d] text-[#ffffff] px-2.5 py-0.5 rounded-md border border-[#151515] font-semibold">
                    Topic: {question.topic}
                  </span>
                  {question.pattern && (
                    <span className="text-xs font-mono bg-[#151515] text-[#f5f5f5] px-2.5 py-0.5 rounded-md border border-[#303030] font-semibold">
                      Pattern: {question.pattern}
                    </span>
                  )}
                  {question.company_tags?.map((c) => (
                    <span key={c} className="text-[10px] bg-[#111111] text-[#b6b6b6] px-1.5 py-0.5 rounded border border-[#303030]">
                      {c}
                    </span>
                  ))}
                </div>

                {/* Problem Statement */}
                <div className="space-y-3">
                  <div className="w-pre-wrap leading-relaxed text-[#1f2937] font-normalhitespace">{question.description}</div>
                </div>

                {/* Examples */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs uppercase font-mono font-bold text-[#f5f5f5] tracking-wider">Examples</h4>
                  {question.examples.map((ex, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-[#111111] border border-[#303030] font-mono text-xs space-y-2 shadow-2xs">
                      <div className="font-bold text-[#f5f5f5]">Example {idx + 1}:</div>
                      <div>
                        <span className="text-[#858585]">Input: </span>
                        <span className="text-[#f5f5f5] whitespace-pre-wrap font-semibold">{ex.input}</span>
                      </div>
                      <div>
                        <span className="text-[#858585]">Output: </span>
                        <span className="text-[#e8e8e8] whitespace-pre-wrap font-bold">{ex.output}</span>
                      </div>
                      {ex.explanation && (
                        <div>
                          <span className="text-[#858585]">Explanation: </span>
                          <span className="text-[#b6b6b6] font-sans">{ex.explanation}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                <div className="space-y-2 pt-2 border-t border-[#303030]">
                  <h4 className="text-xs uppercase font-mono font-bold text-[#f5f5f5] tracking-wider">Constraints</h4>
                  <pre className="p-3.5 rounded-xl bg-[#111111] border border-[#303030] font-mono text-xs text-[#b6b6b6] whitespace-pre-wrap shadow-2xs">
                    {question.constraints}
                  </pre>
                </div>
              </>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase font-mono font-bold text-[#f5f5f5]">Personal Notes</h4>
                  <div className="flex items-center gap-2">
                    {noteSaveStatus && <span className="text-xs font-bold text-[#e8e8e8]">{noteSaveStatus}</span>}
                    <Button variant="primary" size="sm" onClick={saveNote} leftIcon={<Save className="w-3.5 h-3.5" />}>
                      Save Note
                    </Button>
                  </div>
                </div>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Record edge cases, algorithmic insights, complexity notes..."
                  rows={15}
                  className="w-full bg-[#111111] border border-[#303030] rounded-xl p-3.5 text-sm text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#bfbfbf] focus:border-[#bfbfbf] resize-none font-mono shadow-2xs"
                />
              </div>
            )}

            {activeTab === 'submissions' && (
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-mono font-bold text-[#f5f5f5]">Submission History</h4>
                {submissions && submissions.length === 0 ? (
                  <p className="text-xs text-[#858585] italic">No submissions yet for this problem.</p>
                ) : (
                  <div className="space-y-2">
                    {submissions?.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-3.5 rounded-xl bg-[#111111] border border-[#303030] flex items-center justify-between text-xs shadow-2xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold ${
                                sub.status === 'Accepted' ? 'text-[#e8e8e8]' : 'text-[#efefef]'
                              }`}
                            >
                              {sub.status}
                            </span>
                            <span className="font-mono text-[#858585] uppercase font-semibold">{sub.language}</span>
                          </div>
                          <div className="text-[11px] text-[#858585]">
                            Passed: {sub.passed_count}/{sub.total_count} • {sub.runtime_ms ? `${sub.runtime_ms.toFixed(1)}ms` : ''}
                          </div>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={async () => {
                            const detail = await submissionsService.getDetail(sub.id);
                            if (detail.code) {
                              setEditorCode(detail.code);
                              handleEditorChange(detail.code);
                            }
                          }}
                        >
                          Restore Code
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'solution' && (
              <div className="space-y-4">
                {question.explanation ? (
                  <div className="p-5 rounded-2xl bg-[#151515]/60 border border-[#303030] space-y-3">
                    <div className="flex items-center gap-2 text-[#ffffff] font-bold text-sm">
                      <Sparkles className="w-4 h-4" /> Official Solution & Explanation
                    </div>
                    <div className="whitespace-pre-wrap text-xs font-mono text-[#f5f5f5] leading-relaxed">
                      {question.explanation}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center border-2 border-dashed border-[#303030] rounded-2xl bg-[#111111]">
                    <Lock className="w-8 h-8 text-[#858585] mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-[#f5f5f5]">Solution Locked</h4>
                    <p className="text-xs text-[#b6b6b6] max-w-xs mx-auto mt-1">
                      Solve the problem and submit an Accepted solution to unlock the official analysis.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Monaco Code Editor + Test Console */}
        <div className="lg:col-span-7 flex flex-col h-full bg-[#111111] overflow-hidden">
          {/* Editor Header Bar */}
          <div className="h-10 px-4 bg-[#111111] border-b border-[#303030] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as any)}
                className="bg-[#080808] border border-[#303030] text-[#f5f5f5] text-xs font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#bfbfbf]"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleResetCode}
                className="text-xs text-[#858585] hover:text-[#ffffff] flex items-center gap-1 font-semibold"
                title="Reset to starter template"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>
            <span className="text-[11px] font-mono text-[#858585] font-semibold">{draftStatus}</span>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 relative border-b border-[#303030]">
            <Editor
              height="100%"
              language={currentLangMeta.monacoLang}
              value={editorCode}
              onChange={handleEditorChange}
              theme="vs"
              options={{
                fontSize: 13,
                fontFamily: 'JetBrains Mono, Fira Code, Menlo, monospace',
                minimap: { enabled: false },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 12, bottom: 12 },
                tabSize: 4,
              }}
            />
          </div>

          {/* Bottom Test Runner & Console */}
          <div className="h-60 border-t border-[#303030] bg-[#FFFDFB] flex flex-col shrink-0">
            {/* Console Header Tabs */}
            <div className="px-4 py-2 border-b border-[#303030] flex items-center justify-between bg-[#111111] shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#f5f5f5] font-bold uppercase tracking-wider">Visible Testcases</span>
                <div className="flex items-center gap-1">
                  {question.visible_test_cases.map((_, idx) => {
                    const testRunResult = runResult?.results[idx];
                    const passed = testRunResult?.passed;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedTestCaseIdx(idx)}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                          selectedTestCaseIdx === idx
                            ? 'bg-[#151515] text-[#ffffff] border border-[#303030] shadow-2xs'
                            : 'text-[#b6b6b6] hover:bg-[#181818]'
                        }`}
                      >
                        <span>Case {idx + 1}</span>
                        {testRunResult && (
                          <span className={`w-2 h-2 rounded-full ${passed ? 'bg-[#e8e8e8]' : 'bg-[#efefef]'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Execution Summary Status */}
              {runResult && (
                <div className="text-xs font-mono font-bold flex items-center gap-2">
                  <span className={runResult.success ? 'text-[#e8e8e8]' : 'text-[#efefef]'}>
                    {runResult.passed_tests}/{runResult.total_tests} Tests Passed
                  </span>
                </div>
              )}
            </div>

            {/* Test Case Inputs & Outputs Content */}
            <div className="flex-1 p-3.5 overflow-y-auto font-mono text-xs space-y-2.5 text-[#b6b6b6]">
              {question.visible_test_cases[selectedTestCaseIdx] && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[#858585] block mb-1 text-[11px] font-bold">Input:</span>
                    <pre className="p-2.5 rounded-lg bg-[#111111] border border-[#303030] text-[#f5f5f5] overflow-x-auto shadow-2xs font-semibold">
                      {question.visible_test_cases[selectedTestCaseIdx].input}
                    </pre>
                  </div>
                  <div>
                    <span className="text-[#858585] block mb-1 text-[11px] font-bold">Expected Output:</span>
                    <pre className="p-2.5 rounded-lg bg-[#171717]/40 border border-[#3a3a3a] text-[#e8e8e8] overflow-x-auto shadow-2xs font-bold">
                      {question.visible_test_cases[selectedTestCaseIdx].expected_output}
                    </pre>
                  </div>
                </div>
              )}

              {/* Actual Run Result Output if available */}
              {runResult?.results[selectedTestCaseIdx] && (
                <div className="pt-2 border-t border-[#303030]">
                  <span className="text-[#858585] block mb-1 text-[11px] font-bold">Your Actual Output:</span>
                  <pre
                    className={`p-2.5 rounded-lg border overflow-x-auto font-bold ${
                      runResult.results[selectedTestCaseIdx].passed
                        ? 'bg-[#171717]/60 border-[#3a3a3a] text-[#e8e8e8]'
                        : 'bg-[#1a1a1a] border-[#494949] text-[#efefef]'
                    }`}
                  >
                    {runResult.results[selectedTestCaseIdx].actual_output || '<empty output>'}
                  </pre>
                </div>
              )}

              {runResult?.compile_output && (
                <div className="pt-2">
                  <span className="text-[#efefef] block mb-1 text-[11px] font-bold">Compile Error:</span>
                  <pre className="p-2.5 rounded-lg bg-[#1a1a1a] border border-[#494949] text-[#efefef] text-xs">
                    {runResult.compile_output}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submission Result Modal */}
      {submitResult && (
        <Modal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          title={submitResult.status === 'Accepted' ? '🎉 Accepted!' : 'Submission Result'}
          size="sm"
        >
          <div className="text-center py-4 space-y-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${
                submitResult.status === 'Accepted'
                  ? 'bg-[#171717] text-[#e8e8e8] border border-[#3a3a3a]'
                  : 'bg-[#1a1a1a] text-[#efefef] border border-[#494949]'
              }`}
            >
              {submitResult.status === 'Accepted' ? (
                <CheckCircle2 className="w-10 h-10" />
              ) : (
                <XCircle className="w-10 h-10" />
              )}
            </div>

            <h3
              className={`text-2xl font-extrabold font-mono ${
                submitResult.status === 'Accepted' ? 'text-[#e8e8e8]' : 'text-[#efefef]'
              }`}
            >
              {submitResult.status}
            </h3>

            {submitResult.ai_evaluation && (
              <div className="depth-panel rounded-2xl p-4 text-left max-w-sm mx-auto">
                <div className="flex items-center justify-between gap-4">
                  <div><span className="text-[10px] tracking-[0.18em] text-[#888] font-bold">AI SCORE</span><div className="text-3xl font-black text-white">{submitResult.ai_evaluation.score.toFixed(1)}<span className="text-sm text-[#777]"> / 10</span></div></div>
                  <div className="text-right text-xs"><div className="font-bold text-white">{submitResult.ai_evaluation.difficulty}</div><div className="text-[#888]">{submitResult.ai_evaluation.correctness_percent.toFixed(0)}% correct</div></div>
                </div>
                <p className="text-xs text-[#aaa] leading-relaxed mt-3">{submitResult.ai_evaluation.feedback}</p>
                <div className="mt-3 text-[10px] text-[#666]">+{submitResult.ai_evaluation.points_awarded.toFixed(1)} scoreboard points · streak updated from today’s activity</div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#080808] border border-[#303030]">
                <span className="text-[#858585] block text-[10px] font-semibold">Test Cases</span>
                <span className="text-[#f5f5f5] font-extrabold text-sm">
                  {submitResult.passed_count}/{submitResult.total_count}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#080808] border border-[#303030]">
                <span className="text-[#858585] block text-[10px] font-semibold">Runtime</span>
                <span className="text-[#f5f5f5] font-extrabold text-sm">
                  {submitResult.runtime_ms ? `${submitResult.runtime_ms.toFixed(1)}ms` : 'N/A'}
                </span>
              </div>
            </div>

            <Button variant="primary" className="w-full mt-4" onClick={() => setIsSubmitModalOpen(false)}>
              Continue Coding
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};