import React from 'react';

/**
 * Clean card container component.
 * Replaces heavy outlines with soft subtle borders and minimal box shadows.
 */
const Card = ({
  children,
  title,
  subtitle,
  action,
  className = '',
  padding = 'p-5',
  noPadding = false,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-1 border border-slate-200/70 dark:border-white/[0.06] bg-slate-50/40 dark:bg-zinc-950/40 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      <div
        className={`bg-white dark:bg-zinc-900 rounded-[calc(1rem-0.25rem)] border border-slate-200/80 dark:border-zinc-800 shadow-xs ${
          onClick ? 'hover:border-slate-300 dark:hover:border-zinc-700 transition duration-150' : ''
        }`}
      >
        {(title || subtitle || action) && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-zinc-800/80">
            <div>
              {title && <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 tracking-[-0.03em]">{title}</h3>}
              {subtitle && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{subtitle}</p>}
            </div>
            {action && <div>{action}</div>}
          </div>
        )}
        <div className={noPadding ? '' : padding}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Card;

