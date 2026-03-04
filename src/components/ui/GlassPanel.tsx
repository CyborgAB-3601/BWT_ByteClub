import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassPanelProps extends HTMLMotionProps<'div'> {
  intensity?: 'low' | 'medium' | 'high';
}

export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, intensity = 'medium', children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          'rounded-2xl border border-line backdrop-blur-md shadow-glass',
          {
            'bg-surface/40': intensity === 'low',
            'bg-surface/60': intensity === 'medium',
            'bg-surface/80': intensity === 'high',
          },
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
GlassPanel.displayName = 'GlassPanel';
