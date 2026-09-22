import React from 'react';

/**
 * Premium single-surface Card component.
 * Eliminates artificial nested double-bezels in favor of crisp, modern SaaS container architecture.
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
      className={`bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-xl shadow-xs transition-colors ${
        onClick ? 'cursor-pointer hover:border-slate-300 dark:hover:border-zinc-700 active:scale-[0.99] transition duration-150' : ''
      } ${className}`}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-zinc-800/80">
          <div>
            {title && (
              <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : padding}>
        {children}
      </div>
    </div>
  );
};

export default Card;
