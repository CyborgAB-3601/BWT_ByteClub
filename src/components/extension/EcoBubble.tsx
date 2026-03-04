import React, { useState, useEffect } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { Globe, Leaf, Zap, Thermometer, Sun, Snowflake, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMultiplier, BASE_RATE } from '@/lib/storage';

interface EcoBubbleProps {
  onClick: () => void;
  isOpen: boolean;
  alertState?: 'normal' | 'heat' | 'cold' | 'daylight';
}

export const EcoBubble = ({ onClick, isOpen, alertState = 'normal' }: EcoBubbleProps) => {
  const controls = useAnimation();
  const [isDragging, setIsDragging] = useState(false);
  const [currentIntensity, setCurrentIntensity] = useState<'low' | 'medium' | 'high'>('low');
  const [currentRate, setCurrentRate] = useState(0);

  // Check intensity of current site
  useEffect(() => {
    // Only run if we are in a content script context (or if mocked in dev)
    // Listen for URL changes if possible, or poll
    const checkIntensity = () => {
        const domain = window.location.hostname;
        const multiplier = getMultiplier(domain);
        const rate = BASE_RATE * multiplier;
        
        setCurrentRate(rate);
        
        if (multiplier >= 2.4) setCurrentIntensity('high');
        else if (multiplier >= 1.6) setCurrentIntensity('medium');
        else setCurrentIntensity('low');
    };
    
    checkIntensity();
    // Re-check periodically or on navigation
    // 1000ms is responsive enough
    const interval = setInterval(checkIntensity, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const screenWidth = window.innerWidth;
    const x = info.point.x;
    
    // Snap to closest side
    if (x < screenWidth / 2) {
      controls.start({ x: 20, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    } else {
      controls.start({ x: screenWidth - 80, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  // Initial position
  useEffect(() => {
    // Force initial position immediately
    controls.set({ x: window.innerWidth - 80, y: window.innerHeight - 150 });
  }, []);

  const getAlertIcon = () => {
    // Override alert icon if high intensity detected
    if (currentIntensity === 'high') return <AlertTriangle className="w-6 h-6 text-red animate-pulse" />;
    
    // Always return default globe based on intensity, ignore alertState for now to prevent confusion
    // unless we re-implement specific alerts later.
    return <Globe className={`w-8 h-8 ${currentIntensity === 'medium' ? 'text-yellow' : 'text-primary'}`} strokeWidth={1.5} />;
  };

  const getGlowColor = () => {
    if (currentIntensity === 'high') return 'shadow-[0_0_30px_rgba(255,92,124,0.6)] border-red/50 bg-red/10';
    if (currentIntensity === 'medium') return 'shadow-[0_0_30px_rgba(249,214,92,0.4)] border-yellow/50';
    
    // Default low intensity glow
    return 'shadow-neon border-primary/30';
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      animate={controls}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => !isDragging && onClick()}
      className={cn(
        "fixed z-50 cursor-pointer flex flex-col items-center justify-center gap-1",
        isOpen ? "pointer-events-none opacity-0" : "pointer-events-auto opacity-100"
      )}
    >
      <div 
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center bg-surface-solid border transition-all duration-500 relative cursor-move",
          getGlowColor()
        )}
      >
        {getAlertIcon()}
        
        {/* Carbon Rate Indicator - Always Visible below bubble */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-surface-solid/90 backdrop-blur-sm border border-line rounded-md px-1.5 py-0.5 text-[9px] font-mono font-bold whitespace-nowrap shadow-sm pointer-events-none">
           {currentRate > 0 ? `${(currentRate * 1000).toFixed(5)}g/s` : '...'}
        </div>
      </div>
    </motion.div>
  );
};
