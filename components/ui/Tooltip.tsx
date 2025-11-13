'use client';

import { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export default function Tooltip({
  text,
  children,
  position = 'top',
  className = '',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, 200);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent',
  };

  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseEnter}
      onTouchEnd={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          className={`
            absolute z-50 px-3 py-2 text-sm font-medium text-white
            bg-gray-900 dark:bg-gray-700 rounded-lg shadow-lg
            whitespace-nowrap pointer-events-none
            ${positionClasses[position]}
            animate-in fade-in duration-200
          `}
        >
          {text}
          <div
            className={`
              absolute w-0 h-0 border-4
              border-gray-900 dark:border-gray-700
              ${arrowClasses[position]}
            `}
          />
        </div>
      )}
    </div>
  );
}
