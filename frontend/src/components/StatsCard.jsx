import React from 'react';

/**
 * Premium single-surface StatsCard component.
 * High-density, professional metric card with tabular numerals and clean icon accents.
 */
const StatsCard = ({
  title,
  value,
  icon,
  iconBgColor = 'bg-zinc-100 dark:bg-zinc-800/90',
  iconColor = 'text-zinc-800 dark:text-zinc-200',
  trend = null,
  trendUp = true,
  onClick = null,
  className = ''
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-xl p-4 sm:p-5 shadow-xs transition-colors ${
        onClick ? 'cursor-pointer hover:border-slate-300 dark:hover:border-zinc-700 active:scale-[0.99] transition duration-150' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pe-3">
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1 truncate">
            {title}
          </p>
          <p className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono tabular-nums tracking-tight">
            {value}
          </p>
          {trend && (
            <div className={`inline-flex items-center mt-2 px-2 py-0.5 rounded-md text-xs font-medium border ${
              trendUp
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40'
                : 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40'
            }`}>
              <svg className="w-3 h-3 me-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={trendUp ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"}
                />
              </svg>
              <span className="font-mono tabular-nums">{trend}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-2.5 ${iconBgColor} rounded-lg shrink-0 border border-slate-200/60 dark:border-zinc-700/60 flex items-center justify-center`}>
            <div className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`}>
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
