import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';

const ApprovalActionModal = ({ returnId, action, onClose, onComplete }) => {
    const { isUrdu } = useLanguage();
    const [comments, setComments] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (action === 'reject' && !comments.trim()) {
            toast.error(isUrdu ? 'براہ کرم مسترد کرنے کی وجہ درج کریں' : 'Please provide a reason for rejection');
            return;
        }

        try {
            setLoading(true);

            if (action === 'approve') {
                await api.post(`/api/purchase-returns/${returnId}/approve`, { comments });
                toast.success(isUrdu ? 'پرچیز ریٹرن منظور کر لی گئی' : 'Purchase return approved successfully');
            } else {
                await api.post(`/api/purchase-returns/${returnId}/reject`, { reason: comments });
                toast.success(isUrdu ? 'پرچیز ریٹرن مسترد کر دی گئی' : 'Purchase return rejected');
            }

            onComplete();
        } catch (err) {
            console.error(`Error ${action}ing return:`, err);
            toast.error(err.response?.data?.message || (isUrdu ? `کارروائی میں ناکامی ہوئی` : `Failed to ${action} return`));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div dir="ltr" className="bg-card rounded-xl shadow-2xl w-full max-w-md border border-default overflow-hidden text-left">
                {/* Header */}
                <div className="px-6 py-4 border-b border-default flex justify-between items-center">
                    <h2 className="text-xl font-bold text-main">
                        {isUrdu
                            ? (action === 'approve' ? 'Approve Purchase Return (پرچیز ریٹرن منظور کریں)' : 'Reject Purchase Return (پرچیز ریٹرن مسترد کریں)')
                            : `${action === 'approve' ? 'Approve' : 'Reject'} Purchase Return`}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-secondary hover:text-main cursor-pointer"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-secondary">
                                {action === 'approve' ? 'Comments (Optional)' : 'Reason for Rejection *'}
                            </label>
                            {isUrdu && (
                                <span className="text-xs text-secondary font-urdu">
                                    {action === 'approve' ? 'تبصرہ (اختیاری)' : 'مسترد کرنے کی وجہ'}
                                </span>
                            )}
                        </div>
                        <textarea
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            rows={4}
                            placeholder={action === 'approve'
                                ? (isUrdu ? 'Add any comments... / تبصرہ درج کریں' : 'Add any comments...')
                                : (isUrdu ? 'Please explain why you are rejecting this return... / وجہ بیان کریں' : 'Please explain why you are rejecting this return...')}
                            className="w-full px-4 py-3 border border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-main"
                            required={action === 'reject'}
                        />
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-default flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-default rounded-lg text-secondary hover:bg-surface font-medium cursor-pointer transition-colors"
                            disabled={loading}
                        >
                            {isUrdu ? 'Cancel / منسوخ کریں' : 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            className={`px-5 py-2 rounded-lg text-white font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 ${action === 'approve'
                                    ? 'bg-emerald-600 hover:bg-emerald-700'
                                    : 'bg-rose-600 hover:bg-rose-700'
                                }`}
                            disabled={loading}
                        >
                            {loading
                                ? (isUrdu ? 'Processing... / عمل جاری ہے...' : 'Processing...')
                                : action === 'approve'
                                    ? (isUrdu ? 'Approve / منظور کریں' : 'Approve')
                                    : (isUrdu ? 'Reject / مسترد کریں' : 'Reject')
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApprovalActionModal;
