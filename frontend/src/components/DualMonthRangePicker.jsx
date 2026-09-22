import { useState, useEffect, useRef } from 'react';
import { FiCalendar, FiChevronLeft, FiChevronRight, FiX, FiCheck } from 'react-icons/fi';

const DualMonthRangePicker = ({
    startDate = '',
    endDate = '',
    onChange,
    placeholder = 'Select Date Range',
    className = '',
    align = 'left'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentLeftMonth, setCurrentLeftMonth] = useState(() => {
        if (startDate) {
            const d = new Date(startDate);
            return new Date(d.getFullYear(), d.getMonth(), 1);
        }
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth() - 1, 1);
    });

    const [tempStart, setTempStart] = useState(startDate);
    const [tempEnd, setTempEnd] = useState(endDate);
    const [hoverDate, setHoverDate] = useState(null);
    const [isSelecting, setIsSelecting] = useState(false);

    const containerRef = useRef(null);

    // Sync external props when changed
    useEffect(() => {
        setTempStart(startDate);
        setTempEnd(endDate);
    }, [startDate, endDate]);

    // Handle outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                setIsSelecting(false);
                setHoverDate(null);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const currentRightMonth = new Date(currentLeftMonth.getFullYear(), currentLeftMonth.getMonth() + 1, 1);

    const prevMonth = () => {
        setCurrentLeftMonth(new Date(currentLeftMonth.getFullYear(), currentLeftMonth.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentLeftMonth(new Date(currentLeftMonth.getFullYear(), currentLeftMonth.getMonth() + 1, 1));
    };

    const formatISODate = (year, month, day) => {
        const m = String(month + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        return `${year}-${m}-${d}`;
    };

    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay();
    };

    const handleDateClick = (dateStr) => {
        if (!isSelecting) {
            // First click - start selection
            setTempStart(dateStr);
            setTempEnd('');
            setIsSelecting(true);
            setHoverDate(null);
        } else {
            // Second click - finish selection immediately and auto-apply
            let finalStart = tempStart;
            let finalEnd = dateStr;

            if (new Date(dateStr) < new Date(tempStart)) {
                finalStart = dateStr;
                finalEnd = tempStart;
            }

            setTempStart(finalStart);
            setTempEnd(finalEnd);
            setIsSelecting(false);
            setHoverDate(null);

            if (onChange) {
                onChange({ startDate: finalStart, endDate: finalEnd });
            }
            setIsOpen(false);
        }
    };

    const handleDateMouseEnter = (dateStr) => {
        if (isSelecting && tempStart) {
            setHoverDate(dateStr);
        }
    };

    const applyPreset = (preset) => {
        const today = new Date();
        let start = '';
        let end = '';

        const toStr = (d) => formatISODate(d.getFullYear(), d.getMonth(), d.getDate());

        if (preset === 'today') {
            start = toStr(today);
            end = toStr(today);
        } else if (preset === 'yesterday') {
            const y = new Date(today);
            y.setDate(today.getDate() - 1);
            start = toStr(y);
            end = toStr(y);
        } else if (preset === 'last7') {
            const s = new Date(today);
            s.setDate(today.getDate() - 6);
            start = toStr(s);
            end = toStr(today);
        } else if (preset === 'thisMonth') {
            const s = new Date(today.getFullYear(), today.getMonth(), 1);
            const e = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            start = toStr(s);
            end = toStr(e);
        } else if (preset === 'lastMonth') {
            const s = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const e = new Date(today.getFullYear(), today.getMonth(), 0);
            start = toStr(s);
            end = toStr(e);
        } else if (preset === 'all') {
            start = '';
            end = '';
        }

        setTempStart(start);
        setTempEnd(end);
        setIsSelecting(false);
        setHoverDate(null);

        if (start) {
            const d = new Date(start);
            setCurrentLeftMonth(new Date(d.getFullYear(), d.getMonth(), 1));
        }

        if (onChange) {
            onChange({ startDate: start, endDate: end });
        }
        setIsOpen(false);
    };

    const clearRange = (e) => {
        e?.stopPropagation();
        setTempStart('');
        setTempEnd('');
        setIsSelecting(false);
        setHoverDate(null);
        if (onChange) {
            onChange({ startDate: '', endDate: '' });
        }
    };

    // Calculate effective visual range for active or hover states
    const getEffectiveRange = () => {
        if (isSelecting && tempStart && hoverDate) {
            const s = new Date(tempStart);
            const h = new Date(hoverDate);
            return s <= h
                ? { start: tempStart, end: hoverDate }
                : { start: hoverDate, end: tempStart };
        }
        if (tempStart && tempEnd) {
            return { start: tempStart, end: tempEnd };
        }
        if (tempStart) {
            return { start: tempStart, end: tempStart };
        }
        return { start: null, end: null };
    };

    const { start: activeStart, end: activeEnd } = getEffectiveRange();

    const isDateInRange = (dateStr) => {
        if (!activeStart || !activeEnd || activeStart === activeEnd) return false;
        return dateStr > activeStart && dateStr < activeEnd;
    };

    const isDateStart = (dateStr) => {
        return activeStart === dateStr;
    };

    const isDateEnd = (dateStr) => {
        return activeEnd === dateStr;
    };

    const renderMonthGrid = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });

        const days = [];
        // Empty cells before start day
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
        }

        // Month days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = formatISODate(year, month, day);
            const inRange = isDateInRange(dateStr);
            const isStart = isDateStart(dateStr);
            const isEnd = isDateEnd(dateStr);
            const isSelectedEdge = isStart || isEnd;

            const isToday = formatISODate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) === dateStr;

            let cellBg = '';
            if (isStart && isEnd) {
                cellBg = 'bg-violet-600 text-white rounded-lg shadow-sm font-bold scale-105 z-10';
            } else if (isStart) {
                cellBg = 'bg-violet-600 text-white rounded-l-lg font-bold shadow-xs z-10';
            } else if (isEnd) {
                cellBg = 'bg-violet-600 text-white rounded-r-lg font-bold shadow-xs z-10';
            } else if (inRange) {
                cellBg = 'bg-violet-100 dark:bg-violet-950/60 text-violet-800 dark:text-violet-200 rounded-none font-medium';
            } else {
                cellBg = 'text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg';
            }

            days.push(
                <button
                    key={dateStr}
                    type="button"
                    onClick={() => handleDateClick(dateStr)}
                    onMouseEnter={() => handleDateMouseEnter(dateStr)}
                    className={`h-8 w-full flex items-center justify-center text-xs transition-all relative cursor-pointer ${cellBg} ${
                        isToday && !isSelectedEdge && !inRange ? 'ring-1 ring-violet-500 font-bold' : ''
                    }`}
                >
                    {day}
                </button>
            );
        }

        return (
            <div className="w-64 select-none">
                <div className="text-center font-bold text-sm text-slate-800 dark:text-zinc-100 py-1 mb-2">
                    {monthName}
                </div>
                <div className="grid grid-cols-7 gap-y-1 text-center mb-1">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                        <span key={d} className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500">
                            {d}
                        </span>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-y-1">
                    {days}
                </div>
            </div>
        );
    };

    const displayText = () => {
        if (startDate && endDate) {
            return `${startDate} → ${endDate}`;
        }
        if (startDate) {
            return `${startDate} → Select End Date`;
        }
        return placeholder;
    };

    const popoverAlignClass = align === 'right' ? 'right-0' : 'left-0';

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Trigger Button */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl border bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 cursor-pointer shadow-xs transition-all ${
                    isOpen
                        ? 'border-violet-600 ring-2 ring-violet-500/20'
                        : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
            >
                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                    <FiCalendar className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                    <span className={!startDate && !endDate ? 'text-slate-400 dark:text-zinc-500' : 'font-semibold'}>
                        {displayText()}
                    </span>
                </div>

                <div className="flex items-center gap-1.5">
                    {(startDate || endDate) && (
                        <button
                            type="button"
                            onClick={clearRange}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="Clear date range"
                        >
                            <FiX className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Popover */}
            {isOpen && (
                <div className={`absolute ${popoverAlignClass} mt-2 z-50 p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-md max-w-[calc(100vw-2rem)]`}>
                    {/* Quick Presets Header */}
                    <div className="flex flex-wrap items-center gap-1.5 pb-3 mb-3 border-b border-slate-200 dark:border-zinc-800 text-xs">
                        <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 mr-1 uppercase tracking-wider">
                            Presets:
                        </span>
                        <button
                            type="button"
                            onClick={() => applyPreset('today')}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-violet-100 hover:text-violet-700 dark:hover:bg-violet-950/60 dark:hover:text-violet-300 font-medium transition cursor-pointer"
                        >
                            Today
                        </button>
                        <button
                            type="button"
                            onClick={() => applyPreset('yesterday')}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-violet-100 hover:text-violet-700 dark:hover:bg-violet-950/60 dark:hover:text-violet-300 font-medium transition cursor-pointer"
                        >
                            Yesterday
                        </button>
                        <button
                            type="button"
                            onClick={() => applyPreset('last7')}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-violet-100 hover:text-violet-700 dark:hover:bg-violet-950/60 dark:hover:text-violet-300 font-medium transition cursor-pointer"
                        >
                            Last 7 Days
                        </button>
                        <button
                            type="button"
                            onClick={() => applyPreset('thisMonth')}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-violet-100 hover:text-violet-700 dark:hover:bg-violet-950/60 dark:hover:text-violet-300 font-medium transition cursor-pointer"
                        >
                            This Month
                        </button>
                        <button
                            type="button"
                            onClick={() => applyPreset('lastMonth')}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-violet-100 hover:text-violet-700 dark:hover:bg-violet-950/60 dark:hover:text-violet-300 font-medium transition cursor-pointer"
                        >
                            Last Month
                        </button>
                        <button
                            type="button"
                            onClick={() => applyPreset('all')}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-violet-100 hover:text-violet-700 dark:hover:bg-violet-950/60 dark:hover:text-violet-300 font-medium transition cursor-pointer"
                        >
                            All Time
                        </button>
                    </div>

                    {/* Month Navigation & Dual Calendar */}
                    <div className="relative">
                        {/* Nav Buttons */}
                        <div className="flex items-center justify-between absolute top-0 inset-x-0 z-20 pointer-events-none">
                            <button
                                type="button"
                                onClick={prevMonth}
                                className="pointer-events-auto p-1.5 rounded-lg bg-white/80 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 shadow-xs cursor-pointer"
                                aria-label="Previous Month"
                            >
                                <FiChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={nextMonth}
                                className="pointer-events-auto p-1.5 rounded-lg bg-white/80 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 shadow-xs cursor-pointer"
                                aria-label="Next Month"
                            >
                                <FiChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Dual Month Grids */}
                        <div className="flex flex-col md:flex-row gap-6 items-start pt-1">
                            {renderMonthGrid(currentLeftMonth)}
                            <div className="hidden md:block w-px self-stretch bg-slate-200 dark:bg-zinc-800" />
                            {renderMonthGrid(currentRightMonth)}
                        </div>
                    </div>

                    {/* Footer Status & Instructions */}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200 dark:border-zinc-800 text-xs">
                        <div className="text-slate-500 dark:text-zinc-400">
                            {isSelecting ? (
                                <span className="text-violet-600 dark:text-violet-400 font-semibold flex items-center gap-1.5">
                                    <span className="inline-block w-2 h-2 rounded-full bg-violet-600 animate-pulse" />
                                    Click target end date to auto-apply
                                </span>
                            ) : tempStart && tempEnd ? (
                                <span>Applied: <strong className="text-slate-800 dark:text-zinc-200">{tempStart}</strong> → <strong className="text-slate-800 dark:text-zinc-200">{tempEnd}</strong></span>
                            ) : (
                                <span>Click starting date to begin</span>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={clearRange}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 font-medium transition cursor-pointer"
                            >
                                Reset
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-medium transition cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DualMonthRangePicker;
