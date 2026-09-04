import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Card from '../../components/Card';
import StatsCard from '../../components/StatsCard';
import LoadingSkeleton from '../../components/LoadingSkeleton';

const CashBankPosition = () => {
    const navigate = useNavigate();
    const [position, setPosition] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosition();
    }, []);

    const fetchPosition = async () => {
        try {
            setLoading(true);
            const userData = JSON.parse(localStorage.getItem('user'));
            const token = userData?.token;
            const response = await api.get(
                `/api/cashbank/position`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPosition(response.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load cash/bank position');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="space-y-6">
                    <LoadingSkeleton type="card" rows={3} />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                <PageHeader
                    title="Cash & Bank Position"
                    description="Real-time liquidity snapshot across physical cash and bank balances."
                    actions={
                        <Button
                            onClick={fetchPosition}
                            variant="secondary"
                            icon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            }
                        >
                            Refresh Position
                        </Button>
                    }
                />

                {/* Main Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatsCard
                        title="Cash in Hand"
                        value={`Rs. ${(position?.cashInHand || 0).toLocaleString()}`}
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        }
                        iconBgColor="bg-emerald-50 dark:bg-emerald-900/20"
                        iconColor="text-emerald-600 dark:text-emerald-400"
                    />
                    <StatsCard
                        title="Total Bank Balance"
                        value={`Rs. ${(position?.totalBankBalance || 0).toLocaleString()}`}
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        }
                        iconBgColor="bg-blue-50 dark:bg-blue-900/20"
                        iconColor="text-blue-600 dark:text-blue-400"
                    />
                    <StatsCard
                        title="Total Net Liquidity"
                        value={`Rs. ${(position?.totalLiquidity || 0).toLocaleString()}`}
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        iconBgColor="bg-violet-50 dark:bg-violet-900/20"
                        iconColor="text-violet-600 dark:text-violet-400"
                    />
                </div>

                {/* Visual Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Cash */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Cash Ratio</h3>
                            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {position?.breakdown?.cash?.percentage || 0}%
                            </span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Available Amount:</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">Rs. {(position?.cashInHand || 0).toFixed(2)}</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3">
                                <div
                                    className="bg-emerald-600 h-3 rounded-full transition-all"
                                    style={{ width: `${position?.breakdown?.cash?.percentage || 0}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-400">Physical drawer cash ready for immediate daily operations.</p>
                        </div>
                    </Card>

                    {/* Bank */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Bank Ratio</h3>
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {position?.breakdown?.bank?.percentage || 0}%
                            </span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Bank Balance:</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">Rs. {(position?.totalBankBalance || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Linked Accounts:</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">{position?.breakdown?.bank?.accounts || 0}</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3">
                                <div
                                    className="bg-blue-600 h-3 rounded-full transition-all"
                                    style={{ width: `${position?.breakdown?.bank?.percentage || 0}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-400">Total balance distributed across commercial bank accounts.</p>
                        </div>
                    </Card>
                </div>
            </div>
        </Layout>
    );
};

export default CashBankPosition;

