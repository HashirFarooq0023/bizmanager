import React from 'react';

/**
 * Standard button component enforcing visual consistency across the entire app.
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  icon = null,
  iconPosition = 'left',
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

  const variantClasses = {
    primary: 'bg-violet-700 hover:bg-violet-800 text-white shadow-xs focus:ring-violet-500/40 dark:bg-violet-600 dark:hover:bg-violet-700',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300/80 shadow-xs focus:ring-gray-400/20 dark:bg-gray-800 dark:hover:bg-gray-700/80 dark:text-gray-200 dark:border-gray-700',
    ghost: 'bg-transparent hover:bg-gray-100/80 text-gray-600 hover:text-gray-900 focus:ring-gray-400/20 dark:hover:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-200',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus:ring-rose-500/40 dark:bg-rose-600 dark:hover:bg-rose-700',
    outline: 'bg-transparent hover:bg-violet-50 text-violet-700 border border-violet-300 focus:ring-violet-500/30 dark:hover:bg-violet-950/30 dark:text-violet-400 dark:border-violet-700'
  };

  const sizeClasses = {
    sm: 'px-3.5 py-1.5 text-xs sm:text-sm rounded-lg gap-2 min-h-[38px]',
    md: 'px-4 py-2 text-sm sm:text-base rounded-xl gap-2.5 min-h-[44px]',
    lg: 'px-6 py-2.5 text-base sm:text-lg rounded-2xl gap-3 min-h-[48px]'
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
      ) : icon && iconPosition === 'left' ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}

      <span>{children}</span>

      {!isLoading && icon && iconPosition === 'right' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
    </button>
  );
};

export default Button;
