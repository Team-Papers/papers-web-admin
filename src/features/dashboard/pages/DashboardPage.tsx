import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Users, PenTool, BookOpen, DollarSign, AlertCircle, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Header } from '@/components/organisms/Header';
import { StatCard } from '@/components/molecules/StatCard';
import { Alert } from '@/components/molecules/Alert';
import { Spinner } from '@/components/atoms/Spinner';
import { getStats, type DashboardStats } from '@/lib/api/dashboard';
import { formatCurrency, formatDateTime } from '@/lib/utils/formatters';

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

  return (
    <>
      <Header title={t('nav.dashboard')} />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Utilisateurs" value={stats.totalUsers} icon={<Users size={20} />} index={0} />
          <StatCard title="Auteurs" value={stats.totalAuthors} icon={<PenTool size={20} />} iconBg="bg-success-container text-success" index={1} />
          <StatCard title="Livres" value={stats.totalBooks} icon={<BookOpen size={20} />} iconBg="bg-warning-container text-warning" index={2} />
          <StatCard title="Revenus" value={formatCurrency(stats.totalRevenue)} icon={<DollarSign size={20} />} iconBg="bg-accent-100 text-accent-600" index={3} />
        </div>

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

        {stats.salesChart.length > 0 && (
          <div className="rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-on-surface">Ventes (30 derniers jours)</h2>
              <span className="text-xs text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full">
                {stats.salesChart.length} jours
              </span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.salesChart}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00B4D8" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#00B4D8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: 'var(--color-on-surface-variant)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: 'var(--color-on-surface-variant)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <Tooltip
                  formatter={(v) => formatCurrency(v as number)}
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-outline)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#00B4D8"
                  fill="url(#salesGradient)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {stats.recentTransactions.length > 0 && (
          <div className="rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm animate-fade-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-on-surface">Activité récente</h2>
              <Clock className="h-4 w-4 text-on-surface-variant" />
            </div>
            <div className="space-y-3">
              {stats.recentTransactions.map((tx, index) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3 border-b border-outline-variant last:border-0 animate-fade-up"
                  style={{ animationDelay: `${(index + 2) * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${tx.type === 'SALE' ? 'bg-success-container' : 'bg-error-container'}`}>
                      {tx.type === 'SALE' ? (
                        <TrendingUp className="h-4 w-4 text-success" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-error" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-on-surface">{tx.type === 'SALE' ? 'Vente' : 'Retrait'}</p>
                      <p className="text-xs text-on-surface-variant">{formatDateTime(tx.createdAt)}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${tx.type === 'SALE' ? 'text-success' : 'text-error'}`}>
                    {tx.type === 'SALE' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
