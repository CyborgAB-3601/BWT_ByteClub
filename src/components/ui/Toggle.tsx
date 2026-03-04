import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  icon?: React.ReactNode;
}

export const Toggle = ({ checked, onCheckedChange, label, icon }: ToggleProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          'relative h-8 w-14 rounded-full p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          checked ? 'bg-primary/20 border border-primary/50' : 'bg-surface/40 border border-line'
        )}
      >
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={cn(
            'h-6 w-6 rounded-full shadow-sm',
            checked ? 'bg-primary shadow-[0_0_10px_rgba(46,234,138,0.5)]' : 'bg-text-lo/50'
          )}
        />
      </button>
      {(label || icon) && (
        <span className={cn("text-xs font-medium flex items-center gap-1", checked ? "text-primary" : "text-text-lo")}>
          {icon}
          {label}
        </span>
      )}
    </div>
  );
};
