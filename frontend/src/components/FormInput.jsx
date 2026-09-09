const FormInput = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    placeholder = '',
    required = false,
    error = '',
    disabled = false,
    className = '',
    icon = null,
    ...props
}) => {
    return (
        <div className={`${className}`}>
            {label && (
                <label htmlFor={name} className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    {label} {required && <span className="text-rose-500 dark:text-rose-400">*</span>}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    className={`w-full ${icon ? 'ps-9.5' : 'ps-3.5'} pe-3.5 py-2.5 min-h-[42px] text-sm sm:text-base border transition duration-150 ${
                        error
                            ? 'border-rose-400 dark:border-rose-600 focus:ring-rose-500/20 focus:border-rose-600'
                            : 'border-gray-300/80 dark:border-gray-700 focus:ring-violet-500/20 focus:border-violet-600'
                    } bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl outline-none disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed`}
                    {...props}
                />
            </div>
            {error && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
        </div>
    );
};

export default FormInput;
