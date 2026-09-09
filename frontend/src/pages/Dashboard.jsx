import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import StatsCard from "../components/StatsCard";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import { getAllExpenses } from "../redux/slices/expenseSlice";
import { getAllBills } from "../redux/slices/billSlice";
import { getDashboardStats } from "../redux/slices/reportsSlice";
import { useLanguage } from "../contexts/LanguageContext";
import { useMode } from "../contexts/ModeContext";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { expenses = [] } = useSelector((state) => state.expense);
  const { bills = [] } = useSelector((state) => state.bill);
  const { dashboardStats } = useSelector((state) => state.reports);
  const { isRtl } = useLanguage();
  const { isAsan } = useMode();
  const [showDetailedMetrics, setShowDetailedMetrics] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      dispatch(getAllExpenses());
      dispatch(getAllBills());
      dispatch(getDashboardStats());
    }
  }, [user, navigate, dispatch]);

  if (!user) return null;

  const userName = user?.user?.name || user?.name || "User";
  const shopName = user?.user?.shopName || user?.shopName || "BizManager";

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header & Quick Action Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              {isRtl ? `خوش آمدید، ${userName}` : `Welcome back, ${userName}`}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-urdu">
              {isRtl ? (
                <>دکان <span className="font-bold text-gray-800 dark:text-gray-200">{shopName}</span> کا آج کا تازہ ترین خلاصہ</>
              ) : (
                <>Here's what's happening with <span className="font-semibold text-gray-700 dark:text-gray-300">{shopName}</span> today.</>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={() => navigate('/pos')}
              variant="primary"
              size="md"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              {isRtl ? 'نیا بل بنائیں' : 'New Sale'}
            </Button>
            <Button
              onClick={() => navigate('/udhaar')}
              variant="secondary"
              size="md"
              className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
            >
              {isRtl ? 'ادھار کھاتہ' : 'Udhaar Khata'}
            </Button>
            <Button
              onClick={() => navigate('/inventory')}
              variant="secondary"
              size="md"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              {isRtl ? 'نیا سامان' : 'Add Product'}
            </Button>
            <Button
              onClick={() => navigate('/customers')}
              variant="secondary"
              size="md"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              }
            >
              {isRtl ? 'نیا گاہک' : 'Add Customer'}
            </Button>
          </div>
        </div>

        {/* Primary Overview Metric Row */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {isRtl ? 'آج کا خلاصہ' : 'Today / Overview'}
            </h2>
            <button
              onClick={() => setShowDetailedMetrics(!showDetailedMetrics)}
              className="text-xs font-semibold text-violet-700 dark:text-violet-400 hover:underline cursor-pointer"
            >
              {showDetailedMetrics
                ? (isRtl ? 'تفصیل چھپائیں' : 'Hide Detailed Breakdown')
                : (isRtl ? 'تمام کھاتے دیکھیں' : 'Show All Metrics')}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatsCard
              title={isRtl ? 'کل سیلز' : 'Total Revenue'}
              value={`Rs. ${(dashboardStats?.totalRevenue || 0).toLocaleString()}`}
              iconBgColor="bg-violet-50"
              iconColor="text-violet-700"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />

            <StatsCard
              title={isRtl ? 'وصول شدہ کیش' : 'Collected'}
              value={`Rs. ${(dashboardStats?.totalCollected || 0).toLocaleString()}`}
              iconBgColor="bg-emerald-50"
              iconColor="text-emerald-700"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />

            <div onClick={() => navigate('/udhaar')} className="cursor-pointer transition-transform active:scale-95">
              <StatsCard
                title={isRtl ? 'گاہکوں کا ادھار' : 'Customer Dues'}
                value={`Rs. ${(dashboardStats?.totalCustomerOutstanding || 0).toLocaleString()}`}
                iconBgColor="bg-amber-50"
                iconColor="text-amber-700"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
            </div>

            <StatsCard
              title={isRtl ? 'کل اخراجات' : 'Total Expenses'}
              value={`Rs. ${(dashboardStats?.totalExpenses || 0).toLocaleString()}`}
              iconBgColor="bg-rose-50"
              iconColor="text-rose-700"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />

            <StatsCard
              title={isRtl ? 'خالص منافع' : 'Net Profit'}
              value={`Rs. ${(dashboardStats?.operatingProfit || 0).toLocaleString()}`}
              iconBgColor="bg-purple-50"
              iconColor="text-purple-700"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
            />
          </div>
        </div>


        {/* Detailed Metrics Panel (Collapsible) */}
        {showDetailedMetrics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Supplier Dues</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-0.5">Rs. {(dashboardStats?.totalSupplierOutstanding || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Inventory Value</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-0.5">Rs. {(dashboardStats?.totalInventoryValue || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cash in Hand</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-0.5">Rs. {(dashboardStats?.cashInHand || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bank Balance</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-0.5">Rs. {(dashboardStats?.totalBankBalance || 0).toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Sales Overview Chart */}
        <Card title="Sales Performance" subtitle="Daily revenue trend for the last 30 days">
          {dashboardStats?.dailySales && dashboardStats.dailySales.length > 0 ? (
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardStats.dailySales} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="violetGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6D28D9" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6D28D9" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis
                    dataKey="_id"
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                    tickFormatter={(val) => val.split("-").slice(1).join("/")}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `Rs.${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E5E7EB",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                      fontSize: "12px"
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalSales"
                    name="Sales"
                    stroke="#6D28D9"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#violetGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="No Sales Data Yet"
              description="Create your first sale in POS or Sales Invoices to view sales trends."
              actionLabel="Create Sale"
              onAction={() => navigate('/pos')}
            />
          )}
        </Card>

        {/* Needs Attention & Receivables Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Low Stock Items */}
          <Card
            title="Needs Attention — Low Stock"
            subtitle="Products requiring inventory reorder"
            action={
              <button
                onClick={() => navigate('/inventory')}
                className="text-xs font-semibold text-violet-700 hover:underline cursor-pointer"
              >
                View Inventory
              </button>
            }
          >
            {dashboardStats?.lowStockItems > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                      !
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-amber-900">{dashboardStats.lowStockItems} Items Below Reorder Point</p>
                      <p className="text-[11px] text-amber-700">Check inventory stock management to avoid stockouts</p>
                    </div>
                  </div>
                  <Button onClick={() => navigate('/inventory')} variant="secondary" size="sm">
                    Reorder
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-gray-500">
                All inventory items are currently well-stocked.
              </div>
            )}
          </Card>

          {/* Top Customer Dues */}
          <Card
            title="Top Receivables"
            subtitle="Customers with highest outstanding balance"
            action={
              <button
                onClick={() => navigate('/customers')}
                className="text-xs font-semibold text-violet-700 hover:underline cursor-pointer"
              >
                View All
              </button>
            }
          >
            {dashboardStats?.topCustomersWithDues && dashboardStats.topCustomersWithDues.length > 0 ? (
              <div className="space-y-2.5">
                {dashboardStats.topCustomersWithDues.map((customer, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 flex items-center justify-center text-xs font-bold">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                        {customer.name}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                      Rs. {customer.dues.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-gray-500">
                No customer dues recorded.
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
