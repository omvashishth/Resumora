import React from 'react';

type CTAButtonProps = {
  onClick: () => void;
  primary?: boolean;
  children: React.ReactNode;
};

export const CTAButton: React.FC<CTAButtonProps> = ({ onClick, primary = false, children }) => {
  const className = primary
    ? 'px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wider rounded-[8px] shadow-lg hover:shadow-blue-500/25 transition-all duration-150 cursor-pointer uppercase flex items-center justify-center gap-2'
    : 'px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs tracking-wider rounded-[8px] border border-slate-700 transition-all duration-150 cursor-pointer uppercase flex items-center justify-center gap-2';
  return (
    <button className={className} onClick={onClick}>
      {children}
    </button>
  );
};
