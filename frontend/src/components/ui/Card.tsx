import React from 'react';
import { cn } from '../../utils/cn';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn('rounded-2xl border border-[#303030] bg-gradient-to-br from-[#171717] to-[#0d0d0d] shadow-[14px_14px_34px_rgba(0,0,0,.55),-7px_-7px_22px_rgba(255,255,255,.025),inset_1px_1px_0_rgba(255,255,255,.08)] hover:border-[#454545] hover:-translate-y-0.5 transition-all duration-200', className)} {...props}>{children}</div>
);
export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => <div className={cn('p-5 border-b border-[#2a2a2a]', className)} {...props}>{children}</div>;
export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, children, ...props }) => <h3 className={cn('text-lg font-bold text-[#f5f5f5] tracking-tight', className)} {...props}>{children}</h3>;
export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, children, ...props }) => <p className={cn('text-sm text-[#9a9a9a] mt-1', className)} {...props}>{children}</p>;
export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => <div className={cn('p-5', className)} {...props}>{children}</div>;
export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => <div className={cn('p-5 pt-0 border-t border-[#2a2a2a] mt-4', className)} {...props}>{children}</div>;
