import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';

const ReportsDashboard = () => {
    const navigate = useNavigate();
    const { t } = useTranslation(['reports', 'common']);

    const reportCategories = [
        {
            title: t('reports:transactionReports'),
            icon: '📊',
            color: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
            reports: [
                { name: t('reports:salesReport'), path: '/reports/sales', icon: '💰' },
                { name: t('reports:purchaseReport'), path: '/reports/purchase', icon: '🛒' },
                { name: t('reports:dayBook'), path: '/reports/daybook', icon: '📅' },
                { name: t('reports:allTransactions'), path: '/reports/transactions', icon: '📝' },
                { name: t('reports:profitLoss'), path: '/reports/profit-loss', icon: '📈' },
                { name: t('reports:billWiseProfit'), path: '/reports/bill-profit', icon: '💵' },
                { name: t('reports:cashFlow'), path: '/reports/cashflow', icon: '💸' },
                { name: t('reports:trialBalance'), path: '/reports/trial-balance', icon: '⚖️' },
                { name: t('reports:balanceSheet'), path: '/reports/balance-sheet', icon: '📋' }
            ]
        },
        {
            title: t('reports:partyReports'),
            icon: '👥',
            color: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
            reports: [
                { name: t('reports:partyStatement'), path: '/reports/party-statement', icon: '📄' },
                { name: t('reports:partyWisePL'), path: '/reports/party-pl', icon: '📊' },
                { name: t('reports:allParties'), path: '/reports/all-parties', icon: '👨‍💼' },
                { name: t('reports:partyReportByItem'), path: '/reports/party-item', icon: '📦' },
                { name: t('reports:salesByParty'), path: '/reports/sales-party', icon: '💰' },
                { name: t('reports:purchaseByParty'), path: '/reports/purchase-party', icon: '🛒' },
                { name: t('reports:salesByPartyGroup'), path: '/reports/sales-party-group', icon: '👥' },
                { name: t('reports:purchaseByPartyGroup'), path: '/reports/purchase-party-group', icon: '🏢' }
            ]
        },
        {
            title: t('reports:gstReports'),
            icon: '🏛️',
            color: 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800',
            reports: [
                { name: t('reports:gstr1'), path: '/reports/gstr1', icon: '📑' },
                { name: t('reports:gstr2'), path: '/reports/gstr2', icon: '📑' },
                { name: t('reports:gstr3b'), path: '/reports/gstr3b', icon: '📑' },
                { name: t('reports:gstr9'), path: '/reports/gstr9', icon: '📑' }
            ]
        }
    ];

    return (
        <Layout>
            <PageHeader
                title={t('reports:reportsDashboard')}
                description={t('reports:dashboardSubtitle')}
            />

            <div className="space-y-8">
                {reportCategories.map((category, idx) => (
                    <div key={idx}>
                        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                            <span className="text-3xl">{category.icon}</span>
                            <h2 className="text-2xl font-bold text-main">{category.title}</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {category.reports.map((report, reportIdx) => (
                                <button
                                    key={reportIdx}
                                    onClick={() => navigate(report.path)}
                                    className={`p-6 border-2 rounded-xl ${category.color} hover:shadow-lg transition group`}
                                >
                                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                        <span className="text-3xl group-hover:scale-110 transition">{report.icon}</span>
                                        <div className="ltr:text-left rtl:text-right">
                                            <h3 className="font-bold text-main">{report.name}</h3>
                                            <p className="text-xs text-secondary">{t('reports:viewDetailedReport')}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-2">{t('reports:needCustomReports')}</h3>
                <p className="text-indigo-100 mb-4">{t('reports:customReportsDesc')}</p>
                <button className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition">
                    {t('reports:createCustomReport')}
                </button>
            </div>
        </Layout>
    );
};

export default ReportsDashboard;
