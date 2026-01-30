import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/organisms/Header';
import { Button } from '@/components/atoms/Button';
import { createAdmin } from '@/lib/api/users';

export function CreateAdminPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = form.firstName && form.lastName && form.email && form.password.length >= 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createAdmin(form);
      navigate('/users');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

  return (
    <>
      <Header title={t('createAdminPage.title')} />
      <div className="p-6">
        <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-4 rounded-lg border border-gray-200 bg-white p-6">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{t('createAdminPage.firstName')}</label>
            <input className={inputClass} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{t('createAdminPage.lastName')}</label>
            <input className={inputClass} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{t('createAdminPage.email')}</label>
            <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{t('createAdminPage.password')}</label>
            <input type="password" className={inputClass} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={8} required />
            <p className="mt-1 text-xs text-gray-500">{t('createAdminPage.passwordHint')}</p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={!isValid || loading}>
              {loading ? t('table.loading') : t('actions.create')}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/users')}>
              {t('actions.cancel')}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
