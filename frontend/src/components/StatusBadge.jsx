import React from 'react';

/**
 * Standard pill status badge with soft background and dark text.
 * Used for financial statuses, stock levels, and order states.
 */
const StatusBadge = ({ status, text, size = 'md' }) => {
  const normalized = (status || text || '').toString().toLowerCase().trim();

  // Configuration for different status types
  const statusStyles = {
    // Green / Success
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40',
    in_stock: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40',

    // Red / Danger
    unpaid: 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40',
    inactive: 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40',
    out_of_stock: 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40',
    overdue: 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40',

    // Amber / Warning
    partial: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40',
    partially_paid: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40',
    pending: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40',
    low_stock: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40',

    // Blue / Info
    draft: 'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40',
    processing: 'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40',
    sent: 'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40',
    open: 'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40',

    // Gray / Default
    closed: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    archived: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
  };

  const currentStyle = statusStyles[normalized] || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs sm:text-sm',
    lg: 'px-3.5 py-1 text-sm font-semibold'
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
  const label = (isUrdu && urduStatusMap[normalized]) ? urduStatusMap[normalized] : (text || status);

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${currentStyle} ${sizeClasses[size] || sizeClasses.md}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current me-1.5 opacity-75 shrink-0" />
      <span>{label}</span>
    </span>
  );
};

export default StatusBadge;
