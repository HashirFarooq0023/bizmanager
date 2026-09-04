import { useState } from 'react';
import EmptyState from './EmptyState';
import { TableSkeleton } from './LoadingSkeleton';

const DataTable = ({
    columns,
    data = [],
    onRowClick = null,
    emptyMessage = 'No data available',
    isLoading = false
}) => {
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');

    const handleSort = (columnKey) => {
        if (sortColumn === columnKey) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(columnKey);
            setSortDirection('asc');
        }
    };

    const sortedData = [...data].sort((a, b) => {
        if (!sortColumn) return 0;

        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    if (isLoading) {
        return <TableSkeleton rows={5} cols={columns.length || 4} />;
    }

    if (!data || data.length === 0) {
        return <EmptyState title={emptyMessage} description="There are no records to display at this time." />;
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xs overflow-hidden border border-gray-200/80 dark:border-gray-800">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/80 dark:bg-gray-800/60 border-b border-gray-200/80 dark:border-gray-800">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    onClick={() => column.sortable && handleSort(column.key)}
                                    className={`px-4 py-3 text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase select-none ${column.sortable ? 'cursor-pointer hover:bg-gray-100/70 dark:hover:bg-gray-800' : ''
                                        }`}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>{column.label}</span>
                                        {column.sortable && sortColumn === column.key && (
                                            <svg className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                                                />
                                            </svg>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80 bg-white dark:bg-gray-900">
                        {sortedData.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                onClick={() => onRowClick && onRowClick(row)}
                                className={`transition-colors duration-100 ${onRowClick ? 'cursor-pointer hover:bg-slate-50/80 dark:hover:bg-gray-800/50' : 'hover:bg-slate-50/40 dark:hover:bg-gray-800/30'}`}
                            >
                                {columns.map((column) => (
                                    <td key={column.key} className="px-4 py-3 text-xs sm:text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap">
                                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;
