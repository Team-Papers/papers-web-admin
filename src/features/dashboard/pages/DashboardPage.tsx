import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Users, PenTool, BookOpen, DollarSign, AlertCircle } from 'lucide-react';
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
          <StatCard title="Utilisateurs" value={stats.totalUsers} icon={<Users size={24} />} />
          <StatCard title="Auteurs" value={stats.totalAuthors} icon={<PenTool size={24} />} color="text-success" />
          <StatCard title="Livres" value={stats.totalBooks} icon={<BookOpen size={24} />} color="text-warning" />
          <StatCard title="Revenus" value={formatCurrency(stats.totalRevenue)} icon={<DollarSign size={24} />} color="text-error" />
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
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Ventes (30 derniers jours)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.salesChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => formatCurrency(v as number)} />
                <Area type="monotone" dataKey="amount" stroke="#4285F4" fill="#4285F4" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {stats.recentTransactions.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Activité récente</h2>
            <div className="space-y-3">
              {stats.recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tx.type === 'SALE' ? 'Vente' : 'Retrait'}</p>
                    <p className="text-xs text-gray-500">{formatDateTime(tx.createdAt)}</p>
                  </div>
                  <span className={`text-sm font-semibold ${tx.type === 'SALE' ? 'text-success' : 'text-error'}`}>
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
