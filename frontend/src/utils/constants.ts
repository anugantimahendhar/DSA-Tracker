export const TOPICS = [
  'Arrays',
  'Strings',
  'Hashing',
  'Linked Lists',
  'Stack',
  'Queue',
  'Binary Search',
  'Trees',
  'Heap',
  'Graphs',
  'Recursion',
  'Backtracking',
  'Greedy',
  'Dynamic Programming'
] as const;

export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;

export const LANGUAGES = [
  { id: 'python', name: 'Python 3', monacoLang: 'python', ext: 'py' },
  { id: 'javascript', name: 'JavaScript (Node.js)', monacoLang: 'javascript', ext: 'js' },
  { id: 'cpp', name: 'C++ (GCC)', monacoLang: 'cpp', ext: 'cpp' },
  { id: 'java', name: 'Java (OpenJDK)', monacoLang: 'java', ext: 'java' }
] as const;

export const DIFFICULTY_COLORS: Record<string, { badge: string; text: string; bg: string; border: string }> = {
  Easy: {
    badge: 'bg-[#171717] text-[#e8e8e8] border-[#3a3a3a]',
    text: 'text-[#e8e8e8]',
    bg: 'bg-[#171717]',
    border: 'border-[#3a3a3a]'
  },
  Medium: {
    badge: 'bg-[#1b1b1b] text-[#d0d0d0] border-[#444444]',
    text: 'text-[#d0d0d0]',
    bg: 'bg-[#1b1b1b]',
    border: 'border-[#444444]'
  },
  Hard: {
    badge: 'bg-[#1a1a1a] text-[#f0f0f0] border-[#494949]',
    text: 'text-[#f0f0f0]',
    bg: 'bg-[#1a1a1a]',
    border: 'border-[#494949]'
  }
};

export const STATUS_COLORS: Record<string, { text: string; badge: string }> = {
  SOLVED: {
    text: 'text-[#e1e1e1]',
    badge: 'bg-[#171717] text-[#e1e1e1] border-[#3a3a3a]'
  },
  ATTEMPTED: {
    text: 'text-[#d7d7d7]',
    badge: 'bg-[#1b1b1b] text-[#d7d7d7] border-[#444444]'
  },
  NOT_STARTED: {
    text: 'text-[#57534E]',
    badge: 'bg-[#F5F5F4] text-[#57534E] border-[#D6D3D1]'
  },
  BOOKMARKED: {
    text: 'text-[#d5d5d5]',
    badge: 'bg-[#1b1b1b] text-[#d5d5d5] border-[#444444]'
  },
  FAILED: {
    text: 'text-[#efefef]',
    badge: 'bg-[#1a1a1a] text-[#efefef] border-[#494949]'
  }
};