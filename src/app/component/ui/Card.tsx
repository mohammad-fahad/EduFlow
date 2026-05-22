import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  highlighted?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, highlighted = false, className = '', ...props }) => {
  return (
    <div
      className={`bg-white/70 backdrop-blur-md rounded-2xl border ${
        highlighted ? 'border-amber-400/60 shadow-amber-400/10' : 'border-white/40'
      } p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};