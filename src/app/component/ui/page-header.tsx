'use client';
import React from 'react';

interface PageHeaderProps {
  banglaTitle: string;
  englishTitle: string;
  description?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  banglaTitle,
  englishTitle,
  description,
  action
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--color-border)] mb-4">
      <div>
        <div className="flex flex-wrap items-baseline gap-2">
          <h1 className="text-2xl font-extrabold font-display text-[var(--color-text)] tracking-tight">
            {banglaTitle}
          </h1>
          <span className="text-sm font-medium text-[var(--color-text-muted)] font-mono-edu">
            / {englishTitle}
          </span>
        </div>
        {description && (
          <p className="text-sm text-[var(--color-text-muted)] mt-1 text-balance">
            {description}
          </p>
        )}
      </div>
      {action && <div className="w-full sm:w-auto shrink-0">{action}</div>}
    </div>
  );
};