import React from 'react';
import { GlassPanel } from './GlassPanel';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<'div'> {
  title?: string;
  action?: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, title, action, children, ...props }, ref) => {
    return (
      <GlassPanel
        ref={ref}
        className={cn('p-6 transition-all hover:shadow-card hover:-translate-y-1', className)}
        {...props}
      >
        {(title || action) && (
          <div className="flex items-center justify-between mb-4">
            {title && <h3 className="text-lg font-semibold text-text-hi">{title}</h3>}
            {action && <div>{action}</div>}
          </div>
        )}
        <motion.div className="text-text-lo">{children}</motion.div>
      </GlassPanel>
    );
  }
);
Card.displayName = 'Card';
