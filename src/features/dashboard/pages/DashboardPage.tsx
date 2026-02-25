import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import {
  Users, PenTool, BookOpen, DollarSign, AlertCircle,
  TrendingUp, TrendingDown, ShoppingCart, Star,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Header } from '@/components/organisms/Header';
import { StatCard } from '@/components/molecules/StatCard';
import { Alert } from '@/components/molecules/Alert';
import { Spinner } from '@/components/atoms/Spinner';
import { getStats, type DashboardStats } from '@/lib/api/dashboard';
import { formatCurrency, formatDateTime } from '@/lib/utils/formatters';

const PIE_COLORS = ['#00B4D8', '#0077B6', '#023E8A', '#F77F00', '#FCBF49', '#EAE2B7', '#D62828', '#8338EC', '#FF006E', '#3A86FF'];

export function DashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats().then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!stats) return null;

  const salesChart = stats.salesChart ?? [];
  const newUsersChart = stats.newUsersChart ?? [];
  const topBooks = stats.topBooks ?? [];
  const topAuthors = stats.topAuthors ?? [];
  const categoryDistribution = stats.categoryDistribution ?? [];
  const recentTransactions = stats.recentTransactions ?? [];

  return (
    <>
      <Header title={t('nav.dashboard')} />
      <div className="space-y-6 p-6">
        {/* Row 1: Stat Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard title="Utilisateurs" value={stats.totalUsers ?? 0} icon={<Users size={20} />} index={0} />
          <StatCard title="Auteurs" value={stats.totalAuthors ?? 0} icon={<PenTool size={20} />} iconBg="bg-success-container text-success" index={1} />
          <StatCard title="Livres" value={stats.totalBooks ?? 0} icon={<BookOpen size={20} />} iconBg="bg-warning-container text-warning" index={2} />
          <StatCard title="Ventes" value={stats.totalPurchases ?? 0} icon={<ShoppingCart size={20} />} iconBg="bg-accent-100 text-accent-600" index={3} />
          <StatCard title="Note moyenne" value={`${stats.avgRating ?? 0}/5`} icon={<Star size={20} />} iconBg="bg-warning-container text-warning" index={4} />
          <StatCard title="Revenus" value={formatCurrency(stats.totalRevenue ?? 0)} icon={<DollarSign size={20} />} iconBg="bg-success-container text-success" index={5} />
        </div>

        {/* Alerts */}
        {(stats.pendingAuthors > 0 || stats.pendingBooks > 0) && (
          <div className="space-y-2">
            {stats.pendingAuthors > 0 && (
              <Link to="/authors">
                <Alert variant="warning">
                  <AlertCircle size={16} className="mr-1 inline" />
                  {stats.pendingAuthors} auteur(s) en attente d'approbation
                </Alert>
              </Link>
            )}
            {stats.pendingBooks > 0 && (
              <Link to="/books">
                <Alert variant="info">
                  <AlertCircle size={16} className="mr-1 inline" />
                  {stats.pendingBooks} livre(s) à modérer
                </Alert>
              </Link>
            )}
          </div>
        )}

        {/* Row 2: Sales Chart + New Users Chart */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Sales Chart - 2/3 width */}
          <div className="lg:col-span-2 rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm animate-fade-up">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-base font-semibold text-on-surface">Ventes (30 derniers jours)</h2>
              <span className="rounded-full bg-surface-container px-2.5 py-1 text-xs text-on-surface-variant">
                {salesChart.length} jours
              </span>
            </div>
            {salesChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={salesChart}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00B4D8" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#00B4D8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-on-surface-variant)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--color-on-surface-variant)' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v)} />
                  <Tooltip formatter={(v) => formatCurrency(v as number)} contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-outline)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="amount" stroke="#00B4D8" fill="url(#salesGradient)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[280px] items-center justify-center text-sm text-on-surface-variant">Aucune vente sur les 30 derniers jours</div>
            )}
          </div>

          {/* New Users Chart - 1/3 width */}
          <div className="rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm animate-fade-up" style={{ animationDelay: '50ms' }}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-base font-semibold text-on-surface">Nouveaux inscrits</h2>
              <span className="rounded-full bg-surface-container px-2.5 py-1 text-xs text-on-surface-variant">7 jours</span>
            </div>
            {newUsersChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={newUsersChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-on-surface-variant)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--color-on-surface-variant)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-outline)', borderRadius: '12px' }} />
                  <Bar dataKey="count" fill="#8338EC" radius={[6, 6, 0, 0]} name="Inscrits" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[280px] items-center justify-center text-sm text-on-surface-variant">Aucune inscription récente</div>
            )}
          </div>
        </div>

        {/* Row 3: Top Books + Top Authors + Category Distribution */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Top Books */}
          <div className="rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm animate-fade-up" style={{ animationDelay: '100ms' }}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-on-surface">Top livres</h2>
              <BookOpen className="h-4 w-4 text-on-surface-variant" />
            </div>
            <div className="space-y-3">
              {topBooks.length > 0 ? topBooks.map((book, i) => (
                <div key={book.id} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-container text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt="" className="h-10 w-7 shrink-0 rounded object-cover" />
                  ) : (
                    <div className="flex h-10 w-7 shrink-0 items-center justify-center rounded bg-gray-100">
                      <BookOpen size={12} className="text-gray-400" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-on-surface">{book.title}</p>
                    <p className="text-xs text-on-surface-variant">{book.authorName}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-on-surface">{book.salesCount}</p>
                    <p className="text-xs text-on-surface-variant">ventes</p>
                  </div>
                </div>
              )) : (
                <p className="py-8 text-center text-sm text-on-surface-variant">Aucune vente</p>
              )}
            </div>
          </div>

          {/* Top Authors */}
          <div className="rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm animate-fade-up" style={{ animationDelay: '150ms' }}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-on-surface">Top auteurs</h2>
              <PenTool className="h-4 w-4 text-on-surface-variant" />
            </div>
            <div className="space-y-3">
              {topAuthors.length > 0 ? topAuthors.map((author, i) => (
                <div key={author.id} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success-container text-xs font-bold text-success">
                    {i + 1}
                  </span>
                  {author.photoUrl ? (
                    <img src={author.photoUrl} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                      {author.penName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-on-surface">{author.penName}</p>
                    <p className="text-xs text-on-surface-variant">{author.totalBooks} livre{author.totalBooks > 1 ? 's' : ''}</p>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-success">{formatCurrency(author.totalRevenue)}</p>
                </div>
              )) : (
                <p className="py-8 text-center text-sm text-on-surface-variant">Aucun auteur</p>
              )}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm animate-fade-up" style={{ animationDelay: '200ms' }}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-on-surface">Livres par catégorie</h2>
            </div>
            {categoryDistribution.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="count"
                      nameKey="name"
                    >
                      {categoryDistribution.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-outline)', borderRadius: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                  {categoryDistribution.slice(0, 6).map((cat, i) => (
                    <div key={cat.name} className="flex items-center gap-2 text-xs">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="truncate text-on-surface-variant">{cat.name}</span>
                      <span className="ml-auto font-medium text-on-surface">{cat.count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-[280px] items-center justify-center text-sm text-on-surface-variant">Aucune catégorie</div>
            )}
          </div>
        </div>

        {/* Row 4: Recent Transactions */}
        <div className="rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm animate-fade-up" style={{ animationDelay: '250ms' }}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-on-surface">Activité récente</h2>
            <Link to="/transactions" className="text-xs font-medium text-primary hover:underline">Voir tout</Link>
          </div>
          {recentTransactions.length > 0 ? (
            <div className="space-y-1">
              {recentTransactions.map((tx, index) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-lg px-3 py-3 transition-colors hover:bg-surface-container animate-fade-up"
                  style={{ animationDelay: `${300 + index * 40}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${tx.type === 'SALE' ? 'bg-success-container' : 'bg-error-container'}`}>
                      {tx.type === 'SALE' ? <TrendingUp className="h-4 w-4 text-success" /> : <TrendingDown className="h-4 w-4 text-error" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-on-surface">
                        {tx.type === 'SALE' ? 'Vente' : 'Retrait'}
                        {tx.bookTitle && <span className="text-on-surface-variant"> — {tx.bookTitle}</span>}
                      </p>
                      <p className="text-xs text-on-surface-variant">{tx.authorName} · {formatDateTime(tx.createdAt)}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${tx.type === 'SALE' ? 'text-success' : 'text-error'}`}>
                    {tx.type === 'SALE' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-on-surface-variant">Aucune transaction récente</p>
          )}
        </div>
      </div>
    </>
  );
}
