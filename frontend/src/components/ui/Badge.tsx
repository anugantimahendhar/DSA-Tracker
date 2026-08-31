import React from 'react';
import { cn } from '../../utils/cn';
import { DIFFICULTY_COLORS, STATUS_COLORS } from '../../utils/constants';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'difficulty' | 'status' | 'outline' | 'topic';
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  status?: 'SOLVED' | 'ATTEMPTED' | 'NOT_STARTED' | 'BOOKMARKED' | 'FAILED';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  difficulty,
  status,
  size = 'md',
  children,
  ...props
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  if (variant === 'difficulty' && difficulty) {
    const diffStyles = DIFFICULTY_COLORS[difficulty] || DIFFICULTY_COLORS.Easy;
    return (
      <span
        className={cn(
          'inline-flex items-center font-semibold rounded-md border font-mono tracking-tight',
          sizeClasses,
          diffStyles.badge,
          className
        )}
        {...props}
      >
        {children || difficulty}
      </span>
    );
  }

  if (variant === 'status' && status) {
    const statusStyles = STATUS_COLORS[status] || STATUS_COLORS.NOT_STARTED;
    return (
      <span
        className={cn(
          'inline-flex items-center font-semibold rounded-md border',
          sizeClasses,
          statusStyles.badge,
          className
        )}
        {...props}
      >
        {children || status.replace('_', ' ')}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-md border border-[#303030] bg-[#151515]/50 text-[#b6b6b6]',
        sizeClasses,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};