import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

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
            urduName: 'پانچ ہزار روپیہ',
            urduNote: '5,000 کا نوٹ',
            urduNumeral: '۵۰۰۰',
            type: 'note',
            image: '/currency/note_5000.png',
            landmark: 'Faisal Mosque, Islamabad',
            colorName: 'Mustard Gold / خاکی سنہری',
            theme: {
                bg: 'from-[#854d0e] via-[#a16207] to-[#713f12]',
                border: 'border-[#ca8a04]',
                accent: '#eab308',
                badge: 'bg-[#ca8a04] text-white',
                shadow: 'shadow-amber-900/30',
                text: 'text-amber-100',
            }
        },
        {
            value: 1000,
            name: 'Rs. 1,000 Note',
            urduName: 'ایک ہزار روپیہ',
            urduNote: '1,000 کا نوٹ',
            urduNumeral: '۱۰۰۰',
            type: 'note',
            image: '/currency/note_1000.png',
            landmark: 'Islamia College, Peshawar',
            colorName: 'Royal Blue / نیلا',
            theme: {
                bg: 'from-[#1e3a8a] via-[#1d4ed8] to-[#172554]',
                border: 'border-[#3b82f6]',
                accent: '#60a5fa',
                badge: 'bg-[#2563eb] text-white',
                shadow: 'shadow-blue-900/30',
                text: 'text-blue-100',
            }
        },
        {
            value: 500,
            name: 'Rs. 500 Note',
            urduName: 'پانچ سو روپیہ',
            urduNote: '500 کا نوٹ',
            urduNumeral: '۵۰۰',
            type: 'note',
            image: '/currency/note_500.png',
            landmark: 'Badshahi Mosque, Lahore',
            colorName: 'Emerald Green / سبز',
            theme: {
                bg: 'from-[#064e3b] via-[#047857] to-[#022c22]',
                border: 'border-[#10b981]',
                accent: '#34d399',
                badge: 'bg-[#059669] text-white',
                shadow: 'shadow-emerald-900/30',
                text: 'text-emerald-100',
            }
        },
        {
            value: 100,
            name: 'Rs. 100 Note',
            urduName: 'ایک سو روپیہ',
            urduNote: '100 کا نوٹ',
            urduNumeral: '۱۰۰',
            type: 'note',
            image: '/currency/note_100.png',
            landmark: 'Ziarat Residency, Quetta',
            colorName: 'Crimson Red / لال',
            theme: {
                bg: 'from-[#881337] via-[#be123c] to-[#4c0519]',
                border: 'border-[#f43f5e]',
                accent: '#fb7185',
                badge: 'bg-[#e11d48] text-white',
                shadow: 'shadow-rose-900/30',
                text: 'text-rose-100',
            }
        },
        {
            value: 50,
            name: 'Rs. 50 Note',
            urduName: 'پچاس روپیہ',
            urduNote: '50 کا نوٹ',
            urduNumeral: '۵۰',
            type: 'note',
            image: '/currency/note_50.png',
            landmark: 'Karakoram (K2) Peak',
            colorName: 'Purple / جامنی',
            theme: {
                bg: 'from-[#581c87] via-[#7c3aed] to-[#3b0764]',
                border: 'border-[#a855f7]',
                accent: '#c084fc',
                badge: 'bg-[#9333ea] text-white',
                shadow: 'shadow-purple-900/30',
                text: 'text-purple-100',
            }
        },
        {
            value: 20,
            name: 'Rs. 20 Note',
            urduName: 'بیس روپیہ',
            urduNote: '20 کا نوٹ',
            urduNumeral: '۲۰',
            type: 'note',
            image: '/currency/note_20.png',
            landmark: 'Mohenjo-daro, Sindh',
            colorName: 'Orange Brown / نارنجی',
            theme: {
                bg: 'from-[#7c2d12] via-[#c2410c] to-[#431407]',
                border: 'border-[#f97316]',
                accent: '#fb923c',
                badge: 'bg-[#ea580c] text-white',
                shadow: 'shadow-orange-900/30',
                text: 'text-orange-100',
            }
        },
        {
            value: 10,
            name: 'Rs. 10 Note',
            urduName: 'دس روپیہ',
            urduNote: '10 کا نوٹ',
            urduNumeral: '۱۰',
            type: 'note',
            image: '/currency/note_10.png',
            landmark: 'Bab-e-Khyber, KP',
            colorName: 'Olive Green / زیتونی',
            theme: {
                bg: 'from-[#365314] via-[#4d7c0f] to-[#1a2e05]',
                border: 'border-[#84cc16]',
                accent: '#a3e635',
                badge: 'bg-[#65a30d] text-white',
                shadow: 'shadow-lime-900/30',
                text: 'text-lime-100',
            }
        },
        {
            value: 5,
            name: 'Rs. 5 Coin',
            urduName: 'پانچ روپیہ سکہ',
            urduNote: '5 کا سکہ',
            urduNumeral: '۵',
            type: 'coin',
            theme: {
                bg: 'from-[#ca8a04] via-[#eab308] to-[#a16207]',
                border: 'border-[#facc15]',
                accent: '#fef08a',
                badge: 'bg-[#ca8a04] text-white',
                shadow: 'shadow-yellow-900/30',
                text: 'text-yellow-950',
            }
        },
        {
            value: 2,
            name: 'Rs. 2 Coin',
            urduName: 'دو روپیہ سکہ',
            urduNote: '2 کا سکہ',
            urduNumeral: '۲',
            type: 'coin',
            theme: {
                bg: 'from-[#64748b] via-[#94a3b8] to-[#475569]',
                border: 'border-[#cbd5e1]',
                accent: '#f1f5f9',
                badge: 'bg-[#64748b] text-white',
                shadow: 'shadow-slate-900/30',
                text: 'text-slate-950',
            }
        },
        {
            value: 1,
            name: 'Rs. 1 Coin',
            urduName: 'ایک روپیہ سکہ',
            urduNote: '1 کا سکہ',
            urduNumeral: '۱',
            type: 'coin',
            theme: {
                bg: 'from-[#71717a] via-[#a1a1aa] to-[#52525b]',
                border: 'border-[#d4d4d8]',
                accent: '#f4f4f5',
                badge: 'bg-[#71717a] text-white',
                shadow: 'shadow-zinc-900/30',
                text: 'text-zinc-950',
            }
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

/**
 * Realistic Pakistani Banknote Graphic Component
 */
const PakistaniBanknoteCard = ({ unit, count, isUrdu }) => {
    if (unit.type === 'coin') {
        return (
            <div className="flex items-center justify-between p-3 rounded-2xl border border-default bg-card/80 backdrop-blur-xs shadow-xs hover:border-violet-500/40 transition">
                <div className="flex items-center gap-3">
                    {/* Realistic 3D Metallic Coin */}
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${unit.theme.bg} border-2 ${unit.theme.border} flex flex-col items-center justify-center shadow-md shrink-0 relative overflow-hidden ring-1 ring-black/10`}>
                        <div className="absolute inset-0.5 rounded-full border border-dashed border-white/40" />
                        <span className="text-[9px] font-black font-urdu text-white leading-none">★</span>
                        <span className="text-sm font-black font-mono text-white leading-tight">{unit.value}</span>
                        <span className="text-[7px] font-bold text-white/90 leading-none">RUPEES</span>
                    </div>

                    <div>
                        <div className="font-bold text-sm text-main flex items-center gap-1.5">
                            <span>{isUrdu ? unit.urduNote : unit.name}</span>
                        </div>
                        <div className="text-xs text-secondary font-mono">
                            {count} × Rs. {unit.value} = <strong className="text-main">Rs. {(count * unit.value).toLocaleString()}</strong>
                        </div>
                    </div>
                </div>

                {/* Big Count Badge */}
                <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1.5 rounded-xl text-xs font-black font-mono bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900 shadow-sm">
                        × {count} {isUrdu ? 'سکے' : (count > 1 ? 'Coins' : 'Coin')}
                    </span>
                </div>
            </div>
        );
    }

    // Banknote Card (Real High-Res Image or Vector Graphic)
    return (
        <div className="p-2 sm:p-2.5 rounded-xl border border-default bg-card shadow-xs hover:border-violet-500/40 transition flex items-center justify-between gap-2.5">
            {/* Real Banknote Image Frame (Compact & Crisp) */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {unit.image ? (
                    <div className="relative w-[115px] sm:w-[140px] h-[48px] sm:h-[58px] rounded-lg overflow-hidden border border-default/80 shadow-xs select-none bg-slate-950/5 shrink-0 flex items-center justify-center">
                        <img
                            src={unit.image}
                            alt={unit.name}
                            className="w-full h-full object-cover object-center rounded-lg"
                            loading="lazy"
                        />
                    </div>
                ) : (
                    /* Vector Fallback */
                    <div className="relative w-[115px] sm:w-[140px] h-[48px] sm:h-[58px] rounded-lg overflow-hidden border border-white/20 shadow-xs select-none bg-gradient-to-r ${unit.theme.bg} shrink-0 p-1.5 flex flex-col justify-between text-white">
                        <div className="flex justify-between items-center text-[8px] font-bold">
                            <span>{isUrdu ? 'بینک دولت پاکستان' : 'SBP'}</span>
                            <span className="font-mono">{unit.value}</span>
                        </div>
                        <div className="text-right font-mono font-black text-sm">
                            {unit.value.toLocaleString()}
                        </div>
                    </div>
                )}

                <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs sm:text-sm text-main truncate">
                        {isUrdu ? unit.urduNote : unit.name}
                    </div>
                    <div className="text-[11px] text-secondary font-mono">
                        Rs. {unit.value.toLocaleString()} per note
                    </div>
                </div>
            </div>

            {/* Note Multiplier Badge & Total */}
            <div className="flex flex-col items-end justify-center gap-0.5 shrink-0 pl-1">
                <div className="flex items-center gap-1">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono shadow-xs ${unit.theme.badge}`}>
                        × {count} {isUrdu ? 'نوٹ' : (count > 1 ? 'Notes' : 'Note')}
                    </span>
                </div>
                <div className="text-xs font-mono font-bold text-main">
                    = Rs. {(count * unit.value).toLocaleString()}
                </div>
            </div>
        </div>
    );
};

const DenominationBreakdown = ({
    amount = 0,
    label = null,
    urduLabel = null,
    className = '',
}) => {
    const { isUrdu } = useLanguage();
    const numAmount = Math.max(0, Math.round(Number(amount) || 0));
    const breakdown = calculatePKRDenominations(numAmount);

    if (numAmount <= 0 || breakdown.length === 0) {
        return null;
    }

    return (
        <div className={`space-y-3 ${className}`}>
            {/* Header Banner */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <div>
                    <h4 className="text-sm font-bold text-main flex items-center gap-1.5">
                        <span className="text-base">💵</span>
                        <span>{isUrdu ? (urduLabel || 'بقایا واپسی کے اصل نوٹ (گاہک کو دیں)') : (label || 'Change Note Denominations (Give to Customer)')}</span>
                    </h4>
                    <p className="text-xs text-secondary mt-0.5">
                        {isUrdu ? 'کیشئر یہ اصل نوٹ نکال کر گاہک کو واپس کرے:' : 'Hand over the following exact currency notes to customer:'}
                    </p>
                </div>
                <div className="text-right">
                    <span className="text-[11px] text-secondary block">{isUrdu ? 'کل بقایا رقم' : 'Total Change'}</span>
                    <span className="font-mono font-black text-lg text-emerald-600 dark:text-emerald-400">
                        Rs. {numAmount.toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Real Banknote & Coin List */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {breakdown.map((item) => (
                    <PakistaniBanknoteCard
                        key={item.value}
                        unit={item}
                        count={item.count}
                        isUrdu={isUrdu}
                    />
                ))}
            </div>

            {/* Quick Summary Pill */}
            <div className="p-2.5 rounded-xl bg-card border border-default text-xs text-secondary flex items-center justify-between font-medium">
                <span>{isUrdu ? 'خلاصہ: ' : 'Summary: '}</span>
                <span className="font-bold font-mono text-main">
                    {breakdown.map(b => `${b.count} × Rs. ${b.value.toLocaleString()}`).join(' + ')}
                </span>
            </div>
        </div>
    );
};

export default DenominationBreakdown;
