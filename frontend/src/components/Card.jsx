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
      className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200/80 dark:border-gray-800 shadow-xs ${
        onClick ? 'cursor-pointer hover:border-gray-300 dark:hover:border-gray-700 transition duration-150' : ''
      } ${className}`}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            {title && <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : padding}>
        {children}
      </div>
    </div>
  );
};

export default Card;
