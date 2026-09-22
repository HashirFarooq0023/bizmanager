import React from 'react';

/**
 * Standard button component enforcing visual consistency and clean SaaS hierarchy.
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  icon = null,
  leftIcon = null,
  rightIcon = null,
  iconPosition = 'left',
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const resolvedIcon = icon || leftIcon || rightIcon;
  const resolvedPosition = rightIcon ? 'right' : (leftIcon ? 'left' : iconPosition);
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

  const variantClasses = {
    primary: 'bg-violet-700 hover:bg-violet-800 text-white shadow-xs focus:ring-violet-500/40 dark:bg-violet-600 dark:hover:bg-violet-500 dark:text-white dark:focus:ring-violet-400/40',
    secondary: 'bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200/90 shadow-xs focus:ring-zinc-400/20 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 dark:border-zinc-700',
    ghost: 'bg-transparent hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 focus:ring-zinc-400/20 dark:hover:bg-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200',
    danger: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 shadow-xs focus:ring-rose-500/30 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 dark:border-rose-800/60',
    'danger-solid': 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus:ring-rose-500/40 dark:bg-rose-600 dark:hover:bg-rose-700',
    outline: 'bg-transparent hover:bg-zinc-100 text-zinc-900 border border-zinc-300 focus:ring-zinc-400/30 dark:hover:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700'
  };

  const sizeClasses = {
    xs: 'px-2 py-1 text-xs rounded-md gap-1 min-h-[28px]',
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5 min-h-[34px]',
    md: 'px-4 py-2 text-xs sm:text-sm font-medium rounded-lg gap-2 min-h-[38px]',
    lg: 'px-5 py-2.5 text-sm sm:text-base font-semibold rounded-lg gap-2.5 min-h-[44px]'
  };

  return (
    <button
      type={type}
      disabled={isDisabled || isLoading}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${sizeClasses[size] || sizeClasses.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ms-1 me-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : resolvedIcon && resolvedPosition === 'left' ? (
        <span className="shrink-0">{resolvedIcon}</span>
      ) : null}

      <span>{children}</span>

      {!isLoading && resolvedIcon && resolvedPosition === 'right' && (
        <span className="shrink-0">
          {resolvedIcon}
        </span>
      )}
    </button>
  );
};

export default Button;
