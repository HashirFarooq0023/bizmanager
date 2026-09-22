import React from 'react';

/**
 * Standard pill status badge with soft background and clear text.
 * Used for financial statuses, stock levels, order states, and custom children.
 */
const StatusBadge = ({ status, text, children, size = 'md', className = '' }) => {
  const rawStatus = (status || '').toString().toLowerCase().trim();

  // Map aliases like 'danger' -> 'out_of_stock' or 'success' -> 'in_stock'
  const aliasMap = {
    danger: 'out_of_stock',
    error: 'out_of_stock',
    success: 'in_stock',
    warning: 'low_stock',
    info: 'blue'
  };

  const normalized = aliasMap[rawStatus] || rawStatus;

  // Configuration for different status types
  const statusStyles = {
    // Green / Success
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50',
    in_stock: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50',

    // Red / Danger
    unpaid: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50',
    inactive: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50',
    out_of_stock: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50',
    overdue: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50',

    // Amber / Warning
    partial: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50',
    partially_paid: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50',
    pending: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50',
    low_stock: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50',

    // Blue / Info
    draft: 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50',
    processing: 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50',
    sent: 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50',
    open: 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50',

    // Gray / Default
    closed: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
    archived: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
  };

  const currentStyle = statusStyles[normalized] || 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs sm:text-xs',
    lg: 'px-3 py-1 text-sm font-semibold'
  };

  // Status Urdu translations
  const urduStatusMap = {
    paid: 'ادا شدہ',
    unpaid: 'ادھار / باقی',
    partial: 'جزوی ادا',
    partially_paid: 'جزوی ادا',
    completed: 'مکمل',
    active: 'فعال',
    inactive: 'غیر فعال',
    in_stock: 'اسٹاک موجود',
    low_stock: 'کم اسٹاک',
    out_of_stock: 'اسٹاک ختم',
    overdue: 'واجب الادا',
    pending: 'زیر التواء',
    draft: 'مسودہ',
    processing: 'پروسیسنگ',
    sent: 'ارسال شدہ',
    open: 'کھلا',
    closed: 'بند',
    cancelled: 'منسوخ'
  };

  const isUrdu = typeof document !== 'undefined' && document.documentElement.getAttribute('lang') === 'ur';

  // Determine label content
  let labelContent = children;
  if (labelContent === undefined) {
    if (text) {
      labelContent = text;
    } else if (isUrdu && urduStatusMap[normalized]) {
      labelContent = urduStatusMap[normalized];
    } else if (normalized === 'out_of_stock') {
      labelContent = 'Out of Stock';
    } else if (normalized === 'low_stock') {
      labelContent = 'Low Stock';
    } else if (normalized === 'in_stock') {
      labelContent = 'In Stock';
    } else {
      labelContent = status || '';
    }
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${currentStyle} ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current me-1.5 opacity-80 shrink-0" />
      <span className="truncate">{labelContent}</span>
    </span>
  );
};

export default StatusBadge;
