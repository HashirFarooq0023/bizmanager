import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import StatsCard from "../components/StatsCard";
import EmptyState from "../components/EmptyState";
import { getDashboardStats } from "../redux/slices/reportsSlice";
import { useLanguage } from "../contexts/LanguageContext";
import { useMode } from "../contexts/ModeContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { dashboardStats } = useSelector((state) => state.reports);
  const { isRtl } = useLanguage();
  const { isAsan } = useMode();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [showDetailedMetrics, setShowDetailedMetrics] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      dispatch(getDashboardStats());
    }
  }, [user, navigate, dispatch]);

  if (!user) return null;

  const userName = user?.user?.name || user?.name || "User";
  const shopName = user?.user?.shopName || user?.shopName || "BizManager";
  const lowStockItemsList = dashboardStats?.lowStockItemsList || [];
  const lowStockCount = dashboardStats?.lowStockItems || 0;
  const outOfStockCount = dashboardStats?.outOfStockItems || 0;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header & Quick Action Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 shadow-xs">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/50 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {isRtl ? 'لائیو خلاصہ' : 'Live Store Overview'}
            </div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {isRtl ? `خوش آمدید، ${userName}` : `Welcome back, ${userName}`}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                {isRtl ? (
                  <>دکان <span className="font-bold text-zinc-800 dark:text-zinc-200">{shopName}</span> کا آج کا تازہ ترین خلاصہ</>
                ) : (
                  <>Here's what's happening with <span className="font-semibold text-zinc-700 dark:text-zinc-300">{shopName}</span> today.</>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                onClick={() => navigate('/pos')}
                variant="primary"
                size="md"
                className="cursor-pointer shadow-xs"
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
                className="border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-800/60 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-900/40 cursor-pointer"
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
                className="cursor-pointer dark:bg-zinc-800/80 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-700"
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
                className="cursor-pointer dark:bg-zinc-800/80 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-700"
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
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatsCard
              title={isRtl ? 'کل سیلز' : 'Total Revenue'}
              value={`Rs. ${(dashboardStats?.totalRevenue || 0).toLocaleString()}`}
              iconBgColor="bg-zinc-100 dark:bg-zinc-800/90"
              iconColor="text-zinc-800 dark:text-zinc-200"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />

            <StatsCard
              title={isRtl ? 'وصول شدہ کیش' : 'Collected'}
              value={`Rs. ${(dashboardStats?.totalCollected || 0).toLocaleString()}`}
              iconBgColor="bg-emerald-50 dark:bg-emerald-950/50"
              iconColor="text-emerald-700 dark:text-emerald-400"
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
                iconBgColor="bg-amber-50 dark:bg-amber-950/50"
                iconColor="text-amber-700 dark:text-amber-400"
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
              iconBgColor="bg-rose-50 dark:bg-rose-950/50"
              iconColor="text-rose-700 dark:text-rose-400"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />

            <StatsCard
              title={isRtl ? 'خالص منافع' : 'Net Profit'}
              value={`Rs. ${(dashboardStats?.operatingProfit || 0).toLocaleString()}`}
              iconBgColor="bg-violet-50 dark:bg-violet-950/50"
              iconColor="text-violet-700 dark:text-violet-400"
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-white dark:bg-zinc-900/90 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-xs dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {isRtl ? 'سپلائرز کا ادھار' : 'Supplier Dues'}
              </p>
              <p className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1 tabular-nums">
                Rs. {(dashboardStats?.totalSupplierOutstanding || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {isRtl ? 'اسٹاک کی کل مالیت' : 'Inventory Value'}
              </p>
              <p className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1 tabular-nums">
                Rs. {(dashboardStats?.totalInventoryValue || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {isRtl ? 'کیش ان ہینڈ' : 'Cash in Hand'}
              </p>
              <p className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1 tabular-nums">
                Rs. {(dashboardStats?.cashInHand || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {isRtl ? 'بینک بیلنس' : 'Bank Balance'}
              </p>
              <p className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1 tabular-nums">
                Rs. {(dashboardStats?.totalBankBalance || 0).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Sales Overview Chart */}
        <Card
          title={isRtl ? 'سیلز کی کارکردگی' : 'Sales Performance'}
          subtitle={isRtl ? 'پچھلے 30 دنوں کا روزانہ ریونیو ٹرینڈ' : 'Daily revenue trend for the last 30 days'}
        >
          {dashboardStats?.dailySales && dashboardStats.dailySales.length > 0 ? (
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardStats.dailySales} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="violetGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={isDark ? "#27272A" : "#E5E7EB"}
                  />
                  <XAxis
                    dataKey="_id"
                    tick={{ fontSize: 11, fill: isDark ? "#A1A1AA" : "#6B7280" }}
                    tickFormatter={(val) => {
                      if (!val) return '';
                      const parts = String(val).split('-');
                      return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : val;
                    }}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={15}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: isDark ? "#A1A1AA" : "#6B7280" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `Rs.${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#18181B" : "#FFFFFF",
                      borderColor: isDark ? "#3F3F46" : "#E5E7EB",
                      borderRadius: "12px",
                      boxShadow: isDark ? "0 10px 25px -5px rgba(0, 0, 0, 0.5)" : "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                      color: isDark ? "#F4F4F5" : "#111827",
                      fontSize: "12px"
                    }}
                    itemStyle={{ color: isDark ? "#E4E4E7" : "#111827" }}
                    labelStyle={{ color: isDark ? "#A1A1AA" : "#6B7280", fontWeight: "600" }}
                    formatter={(val) => [`Rs. ${Number(val || 0).toLocaleString()}`, isRtl ? 'سیلز' : 'Sales']}
                    labelFormatter={(label) => {
                      if (!label) return '';
                      try {
                        const [y, m, d] = String(label).split('-');
                        return `${d}/${m}/${y}`;
                      } catch {
                        return label;
                      }
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalSales"
                    name="Sales"
                    stroke="#7C3AED"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#violetGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title={isRtl ? 'ابھی کوئی سیلز ڈیٹا نہیں ہے' : 'No Sales Data Yet'}
              description={isRtl ? 'سیلز ٹرینڈ دیکھنے کے لیے پی او ایس میں اپنا پہلا بل بنائیں۔' : 'Create your first sale in POS or Sales Invoices to view sales trends.'}
              actionLabel={isRtl ? 'بل بنائیں' : 'Create Sale'}
              onAction={() => navigate('/pos')}
            />
          )}
        </Card>

        {/* Needs Attention & Receivables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Items (Actionable Table) */}
          <Card
            title={isRtl ? 'توجہ طلب — کم اسٹاک' : 'Needs Attention — Low Stock'}
            subtitle={isRtl ? 'وہ پراڈکٹس جنہیں دوبارہ منگوانے کی ضرورت ہے' : 'Products requiring inventory reorder'}
            action={
              <button
                onClick={() => navigate('/inventory')}
                className="text-xs font-semibold text-violet-700 dark:text-violet-400 hover:underline cursor-pointer"
              >
                {isRtl ? 'تمام سامان دیکھیں' : 'View Inventory'}
              </button>
            }
          >
            {lowStockItemsList.length > 0 || lowStockCount > 0 ? (
              <div className="space-y-3.5">
                {/* Warning Summary Banner */}
                <div className="flex items-center justify-between p-3.5 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 flex items-center justify-center font-bold text-sm shrink-0">
                      !
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                        {outOfStockCount > 0
                          ? `${outOfStockCount} Out of Stock, ${lowStockCount - outOfStockCount} Low Stock`
                          : `${lowStockCount} Items Below Reorder Point`}
                      </p>
                      <p className="text-[11px] text-amber-700 dark:text-amber-400">
                        {isRtl ? 'اسٹاک ختم ہونے سے بچنے کے لیے وقت پر آرڈر کریں' : 'Reorder now to prevent lost sales and stockouts'}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate('/inventory')}
                    variant="secondary"
                    size="sm"
                    className="shrink-0 cursor-pointer dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200 text-xs"
                  >
                    {isRtl ? 'ری آرڈر کریں' : 'Reorder'}
                  </Button>
                </div>

                {/* Items Table / List */}
                {lowStockItemsList.length > 0 && (
                  <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-zinc-800/80">
                    <table className="w-full text-start text-xs">
                      <thead className="bg-slate-50/90 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 border-b border-slate-100 dark:border-zinc-800/80 uppercase font-semibold">
                        <tr>
                          <th className="px-3.5 py-2.5 text-start">{isRtl ? 'پراڈکٹ' : 'Product'}</th>
                          <th className="px-3.5 py-2.5 text-center">{isRtl ? 'موجود اسٹاک' : 'Stock'}</th>
                          <th className="px-3.5 py-2.5 text-center">{isRtl ? 'حد' : 'Limit'}</th>
                          <th className="px-3.5 py-2.5 text-end">{isRtl ? 'حالت' : 'Status'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 bg-white dark:bg-zinc-900/40">
                        {lowStockItemsList.map((item) => {
                          const isZero = item.availableStock === 0 || item.isOutOfStock;
                          return (
                            <tr
                              key={item._id}
                              onClick={() => navigate('/inventory')}
                              className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors"
                            >
                              <td className="px-3.5 py-2.5">
                                <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[160px] sm:max-w-[220px]">
                                  {item.name}
                                </p>
                                {item.sku && (
                                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                                    SKU: {item.sku}
                                  </p>
                                )}
                              </td>
                              <td className="px-3.5 py-2.5 text-center font-mono font-bold tabular-nums">
                                <span className={isZero ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}>
                                  {item.availableStock}
                                </span>
                              </td>
                              <td className="px-3.5 py-2.5 text-center text-zinc-500 dark:text-zinc-400 font-mono tabular-nums">
                                {item.lowStockLimit}
                              </td>
                              <td className="px-3.5 py-2.5 text-end">
                                {isZero ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/50">
                                    {isRtl ? 'ختم' : 'Out of Stock'}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50">
                                    {isRtl ? 'کم' : 'Low Stock'}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-zinc-500 dark:text-zinc-400">
                <svg className="w-8 h-8 mx-auto mb-2 text-emerald-500 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isRtl ? 'تمام پراڈکٹس مناسب مقدار میں موجود ہیں۔' : 'All inventory items are currently well-stocked.'}
              </div>
            )}
          </Card>

          {/* Top Customer Dues */}
          <Card
            title={isRtl ? 'سب سے زیادہ ادھار والے گاہک' : 'Top Receivables'}
            subtitle={isRtl ? 'وہ گاہک جن کے ذمہ سب سے زیادہ رقم واجب الادا ہے' : 'Customers with highest outstanding balance'}
            action={
              <button
                onClick={() => navigate('/customers')}
                className="text-xs font-semibold text-violet-700 dark:text-violet-400 hover:underline cursor-pointer"
              >
                {isRtl ? 'تمام گاہک دیکھیں' : 'View All'}
              </button>
            }
          >
            {dashboardStats?.topCustomersWithDues && dashboardStats.topCustomersWithDues.length > 0 ? (
              <div className="space-y-2.5">
                {dashboardStats.topCustomersWithDues.map((customer, idx) => (
                  <div
                    key={customer._id || idx}
                    onClick={() => navigate('/udhaar')}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/80 hover:border-slate-200 dark:hover:border-zinc-700 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200/50 dark:border-violet-800/50 flex items-center justify-center text-xs font-bold shrink-0">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block">
                          {customer.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                          {isRtl ? 'ادھار کھاتہ کھولیں' : 'Click to view Khata'}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400">
                      Rs. {customer.dues.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-zinc-500 dark:text-zinc-400">
                <svg className="w-8 h-8 mx-auto mb-2 text-emerald-500 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isRtl ? 'کوئی واجب الادا ادھار درج نہیں ہے۔' : 'No customer dues recorded.'}
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
