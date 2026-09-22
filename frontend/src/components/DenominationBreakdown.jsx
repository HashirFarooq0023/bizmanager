import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FiDollarSign, FiInfo } from 'react-icons/fi';

/**
 * Pakistani Currency (PKR) Denomination Breakdown Calculator
 * Breaks down any amount into optimal standard Pakistani currency notes & coins
 */
export const calculatePKRDenominations = (amount) => {
    let remaining = Math.round(Number(amount) || 0);
    if (remaining <= 0) return [];

    const currencyUnits = [
        {
            value: 5000,
            name: 'Rs. 5,000 Note',
            urduName: '5,000 کا نوٹ',
            type: 'note',
            theme: 'from-amber-600/20 to-yellow-600/10 border-amber-500/40 text-amber-900 dark:text-amber-200',
            badgeBg: 'bg-amber-600 text-white',
        },
        {
            value: 1000,
            name: 'Rs. 1,000 Note',
            urduName: '1,000 کا نوٹ',
            type: 'note',
            theme: 'from-blue-600/20 to-indigo-600/10 border-blue-500/40 text-blue-900 dark:text-blue-200',
            badgeBg: 'bg-blue-600 text-white',
        },
        {
            value: 500,
            name: 'Rs. 500 Note',
            urduName: '500 کا نوٹ',
            type: 'note',
            theme: 'from-emerald-600/20 to-green-600/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-200',
            badgeBg: 'bg-emerald-600 text-white',
        },
        {
            value: 100,
            name: 'Rs. 100 Note',
            urduName: '100 کا نوٹ',
            type: 'note',
            theme: 'from-rose-600/20 to-red-600/10 border-rose-500/40 text-rose-900 dark:text-rose-200',
            badgeBg: 'bg-rose-600 text-white',
        },
        {
            value: 50,
            name: 'Rs. 50 Note',
            urduName: '50 کا نوٹ',
            type: 'note',
            theme: 'from-purple-600/20 to-violet-600/10 border-purple-500/40 text-purple-900 dark:text-purple-200',
            badgeBg: 'bg-purple-600 text-white',
        },
        {
            value: 20,
            name: 'Rs. 20 Note',
            urduName: '20 کا نوٹ',
            type: 'note',
            theme: 'from-orange-600/20 to-amber-600/10 border-orange-500/40 text-orange-900 dark:text-orange-200',
            badgeBg: 'bg-orange-600 text-white',
        },
        {
            value: 10,
            name: 'Rs. 10 Note',
            urduName: '10 کا نوٹ',
            type: 'note',
            theme: 'from-teal-600/20 to-emerald-600/10 border-teal-500/40 text-teal-900 dark:text-teal-200',
            badgeBg: 'bg-teal-600 text-white',
        },
        {
            value: 5,
            name: 'Rs. 5 Coin',
            urduName: '5 کا سکہ',
            type: 'coin',
            theme: 'from-yellow-600/20 to-amber-500/10 border-yellow-500/40 text-yellow-900 dark:text-yellow-200',
            badgeBg: 'bg-yellow-600 text-white',
        },
        {
            value: 2,
            name: 'Rs. 2 Coin',
            urduName: '2 کا سکہ',
            type: 'coin',
            theme: 'from-slate-500/20 to-gray-500/10 border-slate-500/40 text-slate-900 dark:text-slate-200',
            badgeBg: 'bg-slate-600 text-white',
        },
        {
            value: 1,
            name: 'Rs. 1 Coin',
            urduName: '1 کا سکہ',
            type: 'coin',
            theme: 'from-zinc-500/20 to-stone-500/10 border-zinc-500/40 text-zinc-900 dark:text-zinc-200',
            badgeBg: 'bg-zinc-600 text-white',
        },
    ];

    const result = [];

    for (const unit of currencyUnits) {
        if (remaining >= unit.value) {
            const count = Math.floor(remaining / unit.value);
            remaining = remaining % unit.value;
            result.push({
                ...unit,
                count,
                total: count * unit.value,
            });
        }
    }

    return result;
};

const DenominationBreakdown = ({
    amount = 0,
    label = null,
    urduLabel = null,
    compact = false,
    className = '',
}) => {
    const { isUrdu } = useLanguage();
    const numAmount = Math.max(0, Math.round(Number(amount) || 0));
    const breakdown = calculatePKRDenominations(numAmount);

    if (numAmount <= 0 || breakdown.length === 0) {
        return null;
    }

    return (
        <div className={`rounded-xl border border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/20 p-3 space-y-2.5 ${className}`}>
            {/* Header / Title */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <span className="p-1 rounded-md bg-emerald-600 text-white">
                        <FiDollarSign className="w-3.5 h-3.5" />
                    </span>
                    <div>
                        <h4 className="text-xs font-bold text-main">
                            {isUrdu ? (urduLabel || 'واپسی کے نوٹوں کی تفصیل (بقایا)') : (label || 'Change Denomination Breakdown')}
                        </h4>
                        <span className="text-[10px] text-secondary block font-medium">
                            {isUrdu ? 'گاہک کو یہ نوٹ واپس کریں:' : 'Hand over these currency notes to customer:'}
                        </span>
                    </div>
                </div>

                <span className="font-mono font-black text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-700">
                    Rs. {numAmount.toLocaleString()}
                </span>
            </div>

            {/* Denomination Notes Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {breakdown.map((item) => (
                    <div
                        key={item.value}
                        className={`p-2 rounded-lg border bg-gradient-to-br ${item.theme} flex items-center justify-between shadow-2xs transition hover:scale-[1.02]`}
                    >
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-main leading-tight">
                                {isUrdu ? item.urduName : item.name}
                            </span>
                            <span className="text-[10px] font-mono opacity-80">
                                = Rs. {item.total.toLocaleString()}
                            </span>
                        </div>

                        {/* Count Pill */}
                        <div className={`px-2 py-0.5 rounded-full text-xs font-black font-mono shadow-xs shrink-0 ${item.badgeBg}`}>
                            {item.count} {isUrdu ? (item.type === 'note' ? 'نوٹ' : 'سکہ') : (item.count > 1 ? 'notes' : 'note')}
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Text Summary for Ultra-fast verification */}
            <div className="text-[11px] text-secondary bg-white/70 dark:bg-black/30 p-2 rounded-lg border border-default flex items-center gap-1 font-medium">
                <FiInfo className="text-emerald-600 shrink-0 w-3.5 h-3.5" />
                <span>
                    {isUrdu ? 'کل واپس کریں: ' : 'Total to return: '}
                    <strong className="text-main font-bold">
                        {breakdown.map(b => `${b.count} × ${isUrdu ? b.urduName : `Rs. ${b.value}`}`).join(' + ')}
                    </strong>
                </span>
            </div>
        </div>
    );
};

export default DenominationBreakdown;
