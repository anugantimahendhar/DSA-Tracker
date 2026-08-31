import React from 'react';
import { FolderSearch } from 'lucide-react';
import { Button } from '../ui/Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = <FolderSearch className="w-10 h-10 text-[#ffffff]" />,
  actionText,
  onAction,
}) => (
  <div className="text-center py-12 px-4 border-2 border-dashed border-[#303030] rounded-2xl bg-[#111111] shadow-2xs">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1d1d1d] border border-[#151515] mb-4 text-[#ffffff]">
      {icon}
    </div>
    <h4 className="text-base font-bold text-[#f5f5f5]">{title}</h4>
    <p className="text-xs text-[#b6b6b6] max-w-sm mx-auto mt-1.5 mb-5">{description}</p>
    {actionText && onAction && (
      <Button variant="secondary" size="sm" onClick={onAction}>
        {actionText}
      </Button>
    )}
  </div>
);