import React from 'react';

/**
 * Reusable Skeleton Loaders for cards, tables, dashboard panels, and lists.
 */
export const CardSkeleton = () => (
  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/80 dark:border-gray-800 p-5 animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded" />
      <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-lg" />
    </div>
    <div className="h-7 w-36 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/80 dark:border-gray-800 overflow-hidden animate-pulse">
    <div className="bg-gray-50 dark:bg-gray-800/50 h-10 border-b border-gray-200 dark:border-gray-800 px-4 flex items-center justify-between">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
      ))}
    </div>
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="px-4 py-3 flex items-center justify-between">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-3.5 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const FormSkeleton = () => (
  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/80 dark:border-gray-800 p-6 space-y-4 animate-pulse">
    <div className="h-5 w-40 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-9 w-full bg-gray-100 dark:bg-gray-800 rounded-lg" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-9 w-full bg-gray-100 dark:bg-gray-800 rounded-lg" />
      </div>
    </div>
  </div>
);

export default CardSkeleton;
