const StatsCard = ({
    title,
    value,
    icon,
    iconBgColor = 'bg-violet-50',
    iconColor = 'text-violet-600',
    trend = null,
    trendUp = true,
    onClick = null
}) => {
    return (
        <div
            className={`bg-white dark:bg-gray-900 rounded-xl shadow-xs border border-gray-200/80 dark:border-gray-800 p-5 ${onClick ? 'cursor-pointer hover:border-gray-300 dark:hover:border-gray-700 transition duration-150' : ''}`}
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1 pr-3">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{value}</p>
                    {trend && (
                        <div className={`inline-flex items-center mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${trendUp ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'}`}>
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d={trendUp ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"}
                                />
                            </svg>
                            <span>{trend}</span>
                        </div>
                    )}
                </div>
                {icon && (
                    <div className={`p-2.5 ${iconBgColor} dark:bg-gray-800/80 rounded-xl flex-shrink-0 border border-gray-100 dark:border-gray-800`}>
                        <div className={`w-5 h-5 ${iconColor} dark:text-violet-400`}>
                            {icon}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatsCard;
