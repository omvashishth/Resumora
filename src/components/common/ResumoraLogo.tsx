import React from 'react';

interface ResumoraLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
  strokeWidth?: number;
  animated?: boolean;
}

const SIZE_MAP = {
  xs: 'w-4 h-4',
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-10 h-10',
};

export const ResumoraLogo: React.FC<ResumoraLogoProps> = ({
  size = 'md',
  className = '',
  showText = false,
  textClassName = '',
  strokeWidth = 2.4,
  animated = false,
}) => {
  const sizeClass = typeof size === 'number' ? '' : SIZE_MAP[size] || SIZE_MAP.md;
  const dimensionStyle = typeof size === 'number' ? { width: size, height: size } : undefined;

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClass} overflow-visible shrink-0 transition-transform duration-300 ${
          animated ? 'hover:scale-110 active:scale-95' : ''
        }`}
        style={dimensionStyle}
        aria-hidden="true"
      >
        <path
          d="M 50,14
             C 59,14 65,24 64,33
             C 64,41 84,27 86,39
             C 88,51 77,57 70,58
             C 63,59 78,74 71,81
             C 64,88 56,71 49,70
             C 42,71 33,87 27,80
             C 21,73 35,59 29,57
             C 22,55 14,48 14,37
             C 14,26 36,39 36,31
             C 36,23 41,14 50,14
             Z"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showText && (
        <span
          className={`font-serif font-bold tracking-tight text-[var(--color-text-primary)] ${textClassName}`}
        >
          Resumora
        </span>
      )}
    </div>
  );
};
