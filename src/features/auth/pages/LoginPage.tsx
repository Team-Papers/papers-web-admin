import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center">
        <h2 className="text-xl font-bold text-on-surface">{t('login')}</h2>
        <p className="mt-1 text-sm text-on-surface-variant">Connectez-vous a votre espace administrateur</p>
      </div>
      {error && <Alert variant="error">{error}</Alert>}
      <FormField
        label={t('email')}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        leftIcon={<Mail size={16} />}
        placeholder="admin@papers237.com"
        required
      />
      <FormField
        label={t('password')}
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        leftIcon={<Lock size={16} />}
        placeholder="Votre mot de passe"
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
        required
      />
      <Button type="submit" isLoading={loading} className="w-full">
        {t('submit')}
      </Button>
    </form>
  );
}
