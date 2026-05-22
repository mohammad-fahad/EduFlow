import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', id, ...props }) => {
  return (
    <div className="w-full mb-4">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
        {label}
      </label>
      <input
        id={id}
        className={`w-full px-4 py-3 bg-white/90 border rounded-xl text-slate-800 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
          error ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-500 mt-1 ml-1 font-medium">{error}</p>}
    </div>
  );
};