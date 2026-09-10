import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { forceLogout, login, googleLogin, reset } from '../redux/slices/authSlice';
import { useLanguage } from '../contexts/LanguageContext';

const DeviceConflictModal = ({ email, password, onClose }) => {
    const dispatch = useDispatch();
    const { isLoading, conflictProvider, pendingGoogleCredential } = useSelector((state) => state.auth);
    const [isProcessing, setIsProcessing] = useState(false);
    const { language, isRtl } = useLanguage ? useLanguage() : { language: 'en', isRtl: false };

    const handleForceLogout = async () => {
        if (isProcessing || isLoading) return; // Prevent multiple calls

        setIsProcessing(true);
        try {
            if (conflictProvider === 'google' && pendingGoogleCredential) {
                // If this is a Google OAuth conflict, force logout previous device & login in one seamless call
                await dispatch(googleLogin({ credential: pendingGoogleCredential, forceLogout: true })).unwrap();
            } else {
                // First, force logout from previous device
                await dispatch(forceLogout({ email, password })).unwrap();

                // If successful, automatically attempt login again
                await dispatch(login({ email, password })).unwrap();
            }

            // Close modal on success
            onClose();
        } catch {
            // Error will be handled by authSlice state
            setIsProcessing(false);
        }
    };

    const handleCancel = () => {
        dispatch(reset());
        onClose();
    };

    const isUrdu = language === 'ur';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-white/[0.08] animate-in fade-in zoom-in-95 duration-200">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="p-3.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-500/20">
                        <svg
                            className="w-8 h-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h2 className={`text-xl font-bold text-center text-slate-900 dark:text-white mb-2 ${isUrdu ? 'font-urdu' : ''}`}>
                    {isUrdu ? 'اکاؤنٹ پہلے سے دوسرے آلہ پر لاگ ان ہے' : 'Device Already Logged In'}
                </h2>

                {/* Message */}
                <p className={`text-center text-sm text-slate-600 dark:text-zinc-400 mb-6 leading-relaxed ${isUrdu ? 'font-urdu' : ''}`}>
                    {isUrdu
                        ? 'یہ اکاؤنٹ فی الحال کسی دوسرے موبائل یا کمپیوٹر پر ایکٹو ہے۔ یہاں لاگ ان کرنے کے لیے پچھلے آلہ سے لاگ آؤٹ کرنا ہوگا۔'
                        : 'This account is currently active on another device. To continue here, your previous session will be logged out.'}
                </p>

                {/* Buttons */}
                <div className="flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={handleForceLogout}
                        disabled={isLoading || isProcessing}
                        className={`w-full bg-gradient-to-b from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white py-3 px-4 rounded-xl font-bold shadow-lg shadow-violet-600/25 border border-white/20 transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 ${isUrdu ? 'font-urdu' : ''}`}
                    >
                        {isLoading || isProcessing ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg
                                    className="animate-spin h-4 w-4 text-white"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                <span>{isUrdu ? 'پچھلے آلہ سے لاگ آؤٹ ہو رہا ہے...' : 'Logging out previous device...'}</span>
                            </span>
                        ) : (
                            <span>{isUrdu ? 'پچھلے آلہ سے لاگ آؤٹ کر کے جاری رکھیں' : 'Log out previous device & continue'}</span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isLoading || isProcessing}
                        className={`w-full bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-zinc-300 py-2.5 px-4 rounded-xl font-semibold border border-slate-200 dark:border-white/[0.08] transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${isUrdu ? 'font-urdu' : ''}`}
                    >
                        {isUrdu ? 'منسوخ کریں' : 'Cancel'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeviceConflictModal;
