import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { FiX, FiAlertCircle, FiUpload, FiTrash2 } from 'react-icons/fi';
import { useLanguage } from '../../contexts/LanguageContext';
import { createExpense, updateExpense, clearBudgetWarnings } from '../../redux/slices/expenseSlice';
import { getAccounts } from '../../redux/slices/cashbankSlice';

const ExpenseForm = ({ expense, categories, onClose }) => {
    const { t } = useTranslation(['purchase', 'common']);
    const { isUrdu } = useLanguage();
    const dispatch = useDispatch();
    const { isLoading, budgetWarnings } = useSelector((state) => state.expense);
    const { accounts } = useSelector((state) => state.cashbank);

    const [formData, setFormData] = useState({
        date: expense?.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        category: expense?.category || '',
        description: expense?.description || '',
        amount: expense?.amount || '',
        paymentMethod: expense?.paymentMethod || 'cash',
        bankAccount: expense?.bankAccount?._id || '',
        referenceNumber: expense?.referenceNumber || '',
        status: expense?.status || 'Paid',
        notes: expense?.notes || '',
        attachments: expense?.attachments || [],
    });

    const [errors, setErrors] = useState({});
    const [showBudgetWarning, setShowBudgetWarning] = useState(false);

    useEffect(() => {
        dispatch(getAccounts());
        return () => {
            dispatch(clearBudgetWarnings());
        };
    }, [dispatch]);

    useEffect(() => {
        if (budgetWarnings && budgetWarnings.length > 0) {
            setShowBudgetWarning(true);
        }
    }, [budgetWarnings]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Clear error for this field
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }

        // Clear bank account if payment method is cash
        if (name === 'paymentMethod' && value === 'cash') {
            setFormData({ ...formData, [name]: value, bankAccount: '', referenceNumber: '' });
        }
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        const fileNames = files.map(file => file.name);
        setFormData({ ...formData, attachments: [...formData.attachments, ...fileNames] });
    };

    const removeAttachment = (index) => {
        const newAttachments = formData.attachments.filter((_, i) => i !== index);
        setFormData({ ...formData, attachments: newAttachments });
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.date) {
            newErrors.date = isUrdu ? 'تاریخ کا انتخاب ضروری ہے' : 'Date is required';
        } else if (new Date(formData.date) > new Date()) {
            newErrors.date = isUrdu ? 'مستقبل کی تاریخ منتخب نہیں کی جا سکتی' : 'Date cannot be in the future';
        }

        if (!formData.category) {
            newErrors.category = isUrdu ? 'زمرہ منتخب کرنا ضروری ہے' : 'Category is required';
        }

        if (!formData.description || formData.description.trim() === '') {
            newErrors.description = isUrdu ? 'تفصیل لکھنا ضروری ہے' : 'Description is required';
        }

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            newErrors.amount = isUrdu ? 'رقم صفر سے زیادہ ہونی چاہیے' : 'Amount must be greater than 0';
        }

        if (['upi', 'card', 'cheque', 'bank_transfer'].includes(formData.paymentMethod) && !formData.bankAccount) {
            newErrors.bankAccount = isUrdu ? 'اس ادائیگی کے لیے بینک کھاتہ منتخب کریں' : `Bank account is required for ${formData.paymentMethod} payment`;
        }

        if (formData.paymentMethod === 'cheque' && (!formData.referenceNumber || formData.referenceNumber.trim() === '')) {
            newErrors.referenceNumber = isUrdu ? 'چیک نمبر درج کرنا ضروری ہے' : 'Cheque number is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            toast.error(isUrdu ? 'براہ کرم فارم میں موجود غلطیاں درست کریں' : 'Please fix the errors in the form');
            return;
        }

        const expenseData = {
            ...formData,
            amount: parseFloat(formData.amount),
            bankAccount: formData.bankAccount || undefined,
            referenceNumber: formData.referenceNumber || undefined,
        };

        try {
            if (expense) {
                await dispatch(updateExpense({ id: expense._id, expenseData })).unwrap();
                toast.success(isUrdu ? 'خرچہ کامیابی سے اپ ڈیٹ ہو گیا' : 'Expense updated successfully');
            } else {
                await dispatch(createExpense(expenseData)).unwrap();
                toast.success(isUrdu ? 'خرچہ کامیابی سے درج ہو گیا' : 'Expense created successfully');
            }
            onClose(true);
        } catch (error) {
            toast.error(typeof error === 'string' ? error : error?.message || (isUrdu ? 'خرچہ محفوظ کرنے میں ناکامی ہوئی' : 'Failed to save expense'));
        }
    };

    const paymentMethods = [
        { value: 'cash', labelEn: 'Cash', labelUr: 'نقد' },
        { value: 'upi', labelEn: 'UPI / Digital', labelUr: 'ڈیجیٹل / یو پی آئی' },
        { value: 'card', labelEn: 'Card', labelUr: 'کارڈ' },
        { value: 'cheque', labelEn: 'Cheque', labelUr: 'چیک' },
        { value: 'bank_transfer', labelEn: 'Bank Transfer', labelUr: 'بینک ٹرانسفر' },
    ];

    const statuses = [
        { value: 'Paid', labelEn: 'Paid', labelUr: 'ادا شدہ' },
        { value: 'Pending', labelEn: 'Pending', labelUr: 'زیر التواء' },
        { value: 'Cancelled', labelEn: 'Cancelled', labelUr: 'منسوخ' },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-default">
                {/* Header */}
                <div className="sticky top-0 bg-card border-b border-default px-6 py-4 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-xl font-bold text-main">
                            {expense ? (isUrdu ? 'خرچہ تبدیل کریں (Edit Expense)' : 'Edit Expense') : (isUrdu ? 'نیا خرچہ درج کریں (Add New Expense)' : 'Add New Expense')}
                        </h2>
                        <p className="text-xs text-muted mt-0.5">
                            {isUrdu ? 'دکان کے اخراجات، کرایہ، بل وغیرہ کا اندراج کریں' : 'Record utility bills, shop rent, salaries, and operating expenses'}
                        </p>
                    </div>
                    <button
                        onClick={() => onClose(false)}
                        className="text-muted hover:text-main transition-colors p-1.5 rounded-lg hover:bg-surface"
                        aria-label="Close"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Budget Warnings */}
                {showBudgetWarning && budgetWarnings && budgetWarnings.length > 0 && (
                    <div className="mx-6 mt-4 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800/50 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <FiAlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                                    {isUrdu ? 'بجٹ انتباہ (Budget Warning)' : 'Budget Warning'}
                                </h3>
                                <ul className="space-y-1">
                                    {budgetWarnings.map((warning, index) => (
                                        <li key={index} className="text-xs text-yellow-700 dark:text-yellow-300">
                                            • {warning.message}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <button
                                onClick={() => setShowBudgetWarning(false)}
                                className="text-yellow-600 hover:text-yellow-800"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Row 1: Date, Category, Status */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="flex items-center justify-between text-sm font-medium text-secondary mb-1.5">
                                <span>Date <span className="text-red-500">*</span></span>
                                <span className="text-xs text-muted font-urdu">تاریخ</span>
                            </label>
                            <input
                                type="date"
                                dir="ltr"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                max={new Date().toISOString().split('T')[0]}
                                className={`w-full px-3 py-2 border rounded-lg bg-input text-main focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-left ${errors.date ? 'border-red-500' : 'border-default'}`}
                            />
                            {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
                        </div>

                        <div>
                            <label className="flex items-center justify-between text-sm font-medium text-secondary mb-1.5">
                                <span>Category <span className="text-red-500">*</span></span>
                                <span className="text-xs text-muted font-urdu">زمرہ</span>
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg bg-input text-main focus:ring-2 focus:ring-primary focus:border-transparent ${errors.category ? 'border-red-500' : 'border-default'}`}
                            >
                                <option value="">{isUrdu ? 'زمرہ منتخب کریں / Select' : 'Select Category'}</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat.name}>
                                        {cat.icon} {cat.name}
                                    </option>
                                ))}
                            </select>
                            {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
                        </div>

                        <div>
                            <label className="flex items-center justify-between text-sm font-medium text-secondary mb-1.5">
                                <span>Status <span className="text-red-500">*</span></span>
                                <span className="text-xs text-muted font-urdu">حیثیت</span>
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-default rounded-lg bg-input text-main focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                {statuses.map((status) => (
                                    <option key={status.value} value={status.value}>
                                        {status.labelEn} / {status.labelUr}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Row 2: Description */}
                    <div>
                        <label className="flex items-center justify-between text-sm font-medium text-secondary mb-1.5">
                            <span>Description <span className="text-red-500">*</span></span>
                            <span className="text-xs text-muted font-urdu">تفصیل</span>
                        </label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder={isUrdu ? 'مثلاً: جنوری کا دکان کا کرایہ، بجلی کا بل...' : 'e.g., Office rent, Electricity bill, Tea expenses...'}
                            className={`w-full px-3 py-2 border rounded-lg bg-input text-main placeholder-muted focus:ring-2 focus:ring-primary focus:border-transparent ${errors.description ? 'border-red-500' : 'border-default'}`}
                        />
                        {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
                    </div>

                    {/* Row 3: Amount, Payment Method */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center justify-between text-sm font-medium text-secondary mb-1.5">
                                <span>Amount (Rs.) <span className="text-red-500">*</span></span>
                                <span className="text-xs text-muted font-urdu">رقم (روپے)</span>
                            </label>
                            <input
                                type="number"
                                dir="ltr"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                className={`w-full px-3 py-2 border rounded-lg bg-input text-main placeholder-muted focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-left ${errors.amount ? 'border-red-500' : 'border-default'}`}
                            />
                            {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
                        </div>

                        <div>
                            <label className="flex items-center justify-between text-sm font-medium text-secondary mb-1.5">
                                <span>Payment Method <span className="text-red-500">*</span></span>
                                <span className="text-xs text-muted font-urdu">ادائیگی کا طریقہ</span>
                            </label>
                            <select
                                name="paymentMethod"
                                value={formData.paymentMethod}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-default rounded-lg bg-input text-main focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                {paymentMethods.map((method) => (
                                    <option key={method.value} value={method.value}>
                                        {method.labelEn} / {method.labelUr}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Row 4: Bank Account & Reference Number (conditional) */}
                    {formData.paymentMethod !== 'cash' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center justify-between text-sm font-medium text-secondary mb-1.5">
                                    <span>Bank Account <span className="text-red-500">*</span></span>
                                    <span className="text-xs text-muted font-urdu">بینک کھاتہ</span>
                                </label>
                                <select
                                    name="bankAccount"
                                    value={formData.bankAccount}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-lg bg-input text-main focus:ring-2 focus:ring-primary focus:border-transparent ${errors.bankAccount ? 'border-red-500' : 'border-default'}`}
                                >
                                    <option value="">{isUrdu ? 'بینک کھاتہ منتخب کریں' : 'Select Bank Account'}</option>
                                    {accounts?.map((acc) => (
                                        <option key={acc._id} value={acc._id}>
                                            {acc.bankName} - {acc.accountType} (Rs. {acc.currentBalance.toFixed(2)})
                                        </option>
                                    ))}
                                </select>
                                {errors.bankAccount && <p className="mt-1 text-xs text-red-500">{errors.bankAccount}</p>}
                            </div>

                            <div>
                                <label className="flex items-center justify-between text-sm font-medium text-secondary mb-1.5">
                                    <span>
                                        Reference Number {formData.paymentMethod === 'cheque' && <span className="text-red-500">*</span>}
                                    </span>
                                    <span className="text-xs text-muted font-urdu">حوالہ / چیک نمبر</span>
                                </label>
                                <input
                                    type="text"
                                    dir="ltr"
                                    name="referenceNumber"
                                    value={formData.referenceNumber}
                                    onChange={handleChange}
                                    placeholder={
                                        formData.paymentMethod === 'cheque'
                                            ? 'Cheque # 123456'
                                            : formData.paymentMethod === 'upi'
                                                ? 'UPI / EasyPaisa / JazzCash ID'
                                                : 'Transaction reference'
                                    }
                                    className={`w-full px-3 py-2 border rounded-lg bg-input text-main placeholder-muted focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-left ${errors.referenceNumber ? 'border-red-500' : 'border-default'}`}
                                />
                                {errors.referenceNumber && <p className="mt-1 text-xs text-red-500">{errors.referenceNumber}</p>}
                            </div>
                        </div>
                    )}

                    {/* Row 5: Notes */}
                    <div>
                        <label className="flex items-center justify-between text-sm font-medium text-secondary mb-1.5">
                            <span>Notes</span>
                            <span className="text-xs text-muted font-urdu">اضافی نوٹس</span>
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="2"
                            placeholder={isUrdu ? 'کوئی اضافی نوٹ یا تفصیل...' : 'Add any additional notes...'}
                            className="w-full px-3 py-2 border border-default rounded-lg bg-input text-main placeholder-muted focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    {/* Row 6: Attachments */}
                    <div>
                        <label className="flex items-center justify-between text-sm font-medium text-secondary mb-1.5">
                            <span>Attachments (Receipt / Bill image)</span>
                            <span className="text-xs text-muted font-urdu">رسید یا بل کی تصویر</span>
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-default rounded-lg cursor-pointer hover:border-primary transition-colors bg-surface/50">
                                <FiUpload className="w-5 h-5 text-muted mr-2" />
                                <span className="text-sm text-secondary">
                                    {isUrdu ? 'فائل یا رسید اپلوڈ کرنے کے لیے کلک کریں' : 'Click to upload receipt or bill'}
                                </span>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    accept="image/*,.pdf,.doc,.docx"
                                />
                            </label>

                            {formData.attachments.length > 0 && (
                                <div className="space-y-2">
                                    {formData.attachments.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between px-3 py-2 bg-surface rounded-lg border border-default"
                                        >
                                            <span className="text-xs text-main truncate font-mono">{file}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeAttachment(index)}
                                                className="text-red-600 hover:text-red-800 ml-2"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-default">
                        <button
                            type="button"
                            onClick={() => onClose(false)}
                            className="px-4 py-2.5 text-secondary bg-surface border border-default rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium cursor-pointer"
                            disabled={isLoading}
                        >
                            {isUrdu ? 'منسوخ کریں (Cancel)' : 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-xs cursor-pointer"
                            disabled={isLoading}
                        >
                            {isLoading ? (isUrdu ? 'محفوظ ہو رہا ہے...' : 'Saving...') : expense ? (isUrdu ? 'اپ ڈیٹ کریں / Update' : 'Update Expense') : (isUrdu ? 'خرچہ محفوظ کریں / Save' : 'Create Expense')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExpenseForm;
