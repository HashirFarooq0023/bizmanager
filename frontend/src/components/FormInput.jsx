const FormInput = ({
    label,
    labelUr = null,
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
    const isUrdu = typeof document !== 'undefined' && document.documentElement.getAttribute('lang') === 'ur';

    return (
        <div className={`${className}`}>
            {label && (
                isUrdu && labelUr ? (
                    <label htmlFor={name} className="flex items-center justify-between text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        <span>{label} {required && <span className="text-rose-500 dark:text-rose-400">*</span>}</span>
                        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 font-urdu">{labelUr}</span>
                    </label>
                ) : (
                    <label htmlFor={name} className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        {label} {required && <span className="text-rose-500 dark:text-rose-400">*</span>}
                    </label>
                )
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute start-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none">
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
                    className={`w-full ${icon ? 'ps-9.5' : 'ps-3.5'} pe-3.5 py-2.5 min-h-[40px] text-sm border transition duration-150 ${
                        error
                            ? 'border-rose-400 dark:border-rose-600 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600'
                            : 'border-slate-200 dark:border-zinc-800 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 dark:focus:border-violet-400'
                    } bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-lg outline-none disabled:bg-slate-50 dark:disabled:bg-zinc-800/60 disabled:text-zinc-400 disabled:cursor-not-allowed`}
                    {...props}
                />
            </div>
            {error && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
        </div>
    );
};

export default FormInput;
