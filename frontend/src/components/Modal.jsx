const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true,
    footer = null
}) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-xl',
        lg: 'max-w-3xl',
        xl: 'max-w-5xl',
        full: 'max-w-full mx-4'
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-opacity">
            <div dir="ltr" className={`bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-slate-200/80 dark:border-zinc-800/80 ${sizeClasses[size] || sizeClasses.md} w-full max-h-[90vh] flex flex-col overflow-hidden text-left`}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 dark:border-zinc-800/80">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{title}</h3>
                    {showCloseButton && (
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                            aria-label="Close modal"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="border-t border-slate-200/80 dark:border-zinc-800/80 px-6 py-3.5 bg-slate-50/70 dark:bg-zinc-900/60 flex items-center justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
