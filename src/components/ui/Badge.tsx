import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'eco' | 'warning' | 'heat' | 'neutral';
}

export const Badge = ({ className, variant = 'neutral', ...props }: BadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        {
          'bg-primary/10 text-primary border-primary/20': variant === 'eco',
          'bg-yellow/10 text-yellow border-yellow/20': variant === 'warning',
          'bg-red/10 text-red border-red/20': variant === 'heat',
          'bg-surface/50 text-text-lo border-line': variant === 'neutral',
        },
        className
      )}
      {...props}
    />
  );
};
