import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import DataTable from '../../components/DataTable';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSkeleton from '../../components/LoadingSkeleton';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const PaymentInList = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user?.token;

    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const response = await api.get(`${API_URL}/api/payment-in`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPayments(response.data);
        } catch (error) {
            console.error('Error fetching payments:', error);
            toast.error('Failed to fetch payment records');
        } finally {
            setLoading(false);
        }
    };

    const filteredPayments = payments.filter(payment => {
        const query = searchQuery.toLowerCase();
        return (
            payment.receiptNumber.toLowerCase().includes(query) ||
            payment.customer?.name?.toLowerCase().includes(query) ||
            payment.customer?.phone?.includes(query)
        );
    });

    const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const columns = [
        {
            key: 'receiptNumber',
            label: 'Receipt No',
            sortable: true,
            render: (val) => <span className="font-semibold text-violet-700 dark:text-violet-400">{val}</span>
        },
        {
            key: 'paymentDate',
            label: 'Date',
            sortable: true,
            render: (val) => <span className="text-gray-600 dark:text-gray-400">{new Date(val).toLocaleDateString()}</span>
        },
        {
            key: 'customer',
            label: 'Customer',
            render: (val) => (
                <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{val?.name}</p>
                    <p className="text-[11px] text-gray-400">{val?.phone}</p>
                </div>
            )
        },
        {
            key: 'totalAmount',
            label: 'Amount',
            sortable: true,
            render: (val) => <span className="font-semibold text-emerald-600 dark:text-emerald-400">Rs. {val.toFixed(2)}</span>
        },
        {
            key: 'paymentMethods',
            label: 'Payment Methods',
            render: (val) => (
                <div className="flex flex-wrap gap-1">
                    {val.map((pm, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 text-[10px] font-semibold rounded-full border border-violet-200/50 dark:border-violet-800/50">
                            {pm.method.toUpperCase()}: Rs. {pm.amount.toFixed(2)}
                        </span>
                    ))}
                </div>
            )
        },
        {
            key: 'allocatedInvoices',
            label: 'Invoices',
            render: (val) => (
                <div>
                    {val.length > 0 ? (
                        <span className="text-gray-600 dark:text-gray-400">{val.length} invoice(s)</span>
                    ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">Advance Payment</span>
                    )}
                </div>
            )
        },
        {
            key: 'excessAmount',
            label: 'Excess/Credit',
            render: (val) => val > 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">+Rs. {val.toFixed(2)}</span>
            ) : (
                <span className="text-gray-400">-</span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (val, row) => (
                <div className="flex items-center space-x-1 justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/sales/payment-in/${row._id}`)}
                    >
                        View
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            navigate(`/sales/payment-in/${row._id}`);
                            setTimeout(() => window.print(), 500);
                        }}
                    >
                        Print
                    </Button>
                </div>
            )
        }
    ];

    return (
        <Layout>
            <div className="space-y-6">
                <PageHeader
                    title="Payment In Records"
                    subtitle="View and manage all received customer payments and receipts"
                    backPath="/sales/payment-in"
                    action={
                        <Button
                            variant="primary"
                            onClick={() => navigate('/sales/payment-in')}
                            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
                        >
                            Record Payment
                        </Button>
                    }
                />

                <Card noPadding>
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by receipt number, customer name, or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
                            />
                            <svg
                                className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-6">
                            <LoadingSkeleton count={5} />
                        </div>
                    ) : (
                        <>
                            <DataTable
                                columns={columns}
                                data={paginatedPayments}
                                emptyMessage={searchQuery ? "No payments found matching your search" : "No payment records found"}
                            />

                            {filteredPayments.length > 0 && (
                                <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                    <div className="text-xs text-gray-500">
                                        Showing {startIndex + 1} to {Math.min(endIndex, filteredPayments.length)} of {filteredPayments.length} payments
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            isDisabled={currentPage === 1}
                                        >
                                            Previous
                                        </Button>
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            isDisabled={currentPage === totalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </Card>
            </div>
        </Layout>
    );
};

export default PaymentInList;

