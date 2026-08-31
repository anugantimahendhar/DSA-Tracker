import React from 'react';
import { Code2, Terminal, Cpu, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => (
  <footer className="border-t border-[#303030] bg-[#111111] py-8 mt-auto shadow-2xs">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#1d1d1d] border border-[#151515] flex items-center justify-center text-[#ffffff]">
          <Code2 className="w-4 h-4" />
        </div>
        <p className="text-xs text-[#b6b6b6]">
          <strong className="text-[#f5f5f5]">DSA TRACKER</strong> — Built for algorithmic mastery with live sandboxed runs.
        </p>
      </div>

      <div className="flex items-center gap-6 text-xs text-[#858585]">
        <span className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-[#e8e8e8]" /> Sandboxed Execution
        </span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#ffffff]" /> Supabase Auth & RLS
        </span>
        <span className="flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-[#d0d0d0]" /> Multi-Language Sandbox
        </span>
      </div>
    </div>
  </footer>
);