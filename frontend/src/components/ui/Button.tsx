import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'emerald';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-150 rounded-lg select-none disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-[#353535] disabled:text-[#777777] disabled:border-[#353535] active:scale-[0.98]';

    const variants = {
      primary: 'bg-[#ffffff] hover:bg-[#dedede] active:bg-[#c8c8c8] text-[#111111] border border-[#ffffff] hover:border-[#dedede] focus:outline-none focus:ring-2 focus:ring-[#bfbfbf] focus:ring-offset-2 focus:ring-offset-[#080808] shadow-sm',
      secondary: 'bg-[#111111] hover:bg-[#1d1d1d] active:bg-[#151515] text-[#ffffff] hover:text-[#dedede] border border-[#ffffff] hover:border-[#dedede] focus:outline-none focus:ring-2 focus:ring-[#bfbfbf] focus:ring-offset-2 focus:ring-offset-[#080808] shadow-xs',
      outline: 'bg-transparent hover:bg-[#1d1d1d] active:bg-[#151515] text-[#b6b6b6] hover:text-[#f5f5f5] border border-[#303030] hover:border-[#ffffff] focus:outline-none focus:ring-2 focus:ring-[#bfbfbf]',
      ghost: 'bg-transparent hover:bg-[#181818] active:bg-[#151515] text-[#b6b6b6] hover:text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#bfbfbf]',
      danger: 'bg-[#efefef] hover:bg-[#d6d6d6] active:bg-[#bcbcbc] text-[#111111] border border-[#efefef] focus:outline-none focus:ring-2 focus:ring-[#bfbfbf] shadow-sm',
      emerald: 'bg-[#e8e8e8] hover:bg-[#15803D] active:bg-[#e1e1e1] text-[#111111] border border-[#e8e8e8] focus:outline-none focus:ring-2 focus:ring-[#bfbfbf] shadow-sm',
    };

    const sizes = {
      sm: 'px-2.5 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-5 py-2.5 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-current" /> : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);
Button.displayName = 'Button';