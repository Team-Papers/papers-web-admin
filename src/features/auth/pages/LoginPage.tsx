import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Mail, Lock } from 'lucide-react';
import { FormField } from '@/components/molecules/FormField';
import { Button } from '@/components/atoms/Button';
import { Alert } from '@/components/molecules/Alert';
import { useAuthStore } from '../store/authStore';

export function LoginPage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error && err.message.includes('administrateurs') ? t('adminOnly') : t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">{t('login')}</h2>
      {error && <Alert variant="error">{error}</Alert>}
      <FormField
        label={t('email')}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        leftIcon={<Mail size={16} />}
        required
      />
      <FormField
        label={t('password')}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        leftIcon={<Lock size={16} />}
        required
      />
      <Button type="submit" isLoading={loading} className="w-full">
        {t('submit')}
      </Button>
    </form>
  );
}
