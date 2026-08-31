import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-[#f5f5f5] mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#858585]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full bg-[#111111] border border-[#303030] text-[#f5f5f5] rounded-lg px-3.5 py-2 text-sm placeholder:text-[#858585] focus:outline-none focus:ring-2 focus:ring-[#bfbfbf] focus:border-[#bfbfbf] transition-all shadow-2xs',
              leftIcon && 'pl-9',
              error && 'border-[#efefef] focus:ring-[#efefef] focus:border-[#efefef]',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-[#efefef]">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';