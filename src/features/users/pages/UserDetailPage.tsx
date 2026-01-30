import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/organisms/Header';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Avatar } from '@/components/atoms/Avatar';
import { Modal } from '@/components/molecules/Modal';
import { Spinner } from '@/components/atoms/Spinner';
import { getUserById, suspendUser, banUser, activateUser, promoteToAdmin, demoteFromAdmin } from '@/lib/api/users';
import { formatDate } from '@/lib/utils/formatters';
import type { User } from '@/types/models';
import { Role, UserStatus } from '@/types/models';

const statusVariant = { [UserStatus.ACTIVE]: 'success', [UserStatus.SUSPENDED]: 'warning', [UserStatus.BANNED]: 'error' } as const;

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<'suspend' | 'ban' | 'activate' | 'promote' | 'demote' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) getUserById(id).then(setUser).finally(() => setLoading(false));
  }, [id]);

  const handleAction = async () => {
    if (!id || !confirmAction) return;
    setActionLoading(true);
    try {
      const actions = { suspend: suspendUser, ban: banUser, activate: activateUser, promote: promoteToAdmin, demote: demoteFromAdmin };
      await actions[confirmAction](id);
      const updated = await getUserById(id);
      setUser(updated);
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;
  if (!user) return null;

  return (
    <>
      <Header title={`${user.firstName} ${user.lastName}`} />
      <div className="p-6 space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-start gap-4">
            <Avatar name={`${user.firstName} ${user.lastName}`} src={user.avatarUrl} size="lg" />
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{user.firstName} {user.lastName}</h2>
              <p className="text-gray-500">{user.email}</p>
              <div className="mt-2 flex gap-2">
                <Badge variant="info">{user.role}</Badge>
                <Badge variant={statusVariant[user.status]}>{t(`status.${user.status.toLowerCase()}`)}</Badge>
              </div>
              <p className="mt-2 text-sm text-gray-500">Inscrit le {formatDate(user.createdAt)}</p>
            </div>
            <div className="flex gap-2">
              {user.role !== Role.ADMIN && user.status === UserStatus.ACTIVE && (
                <Button variant="primary" size="sm" onClick={() => setConfirmAction('promote')}>{t('actions.promote')}</Button>
              )}
              {user.role === Role.ADMIN && (
                <Button variant="secondary" size="sm" onClick={() => setConfirmAction('demote')}>{t('actions.demote')}</Button>
              )}
              {user.status !== UserStatus.ACTIVE && (
                <Button variant="primary" size="sm" onClick={() => setConfirmAction('activate')}>{t('actions.activate')}</Button>
              )}
              {user.status !== UserStatus.SUSPENDED && (
                <Button variant="secondary" size="sm" onClick={() => setConfirmAction('suspend')}>{t('actions.suspend')}</Button>
              )}
              {user.status !== UserStatus.BANNED && (
                <Button variant="danger" size="sm" onClick={() => setConfirmAction('ban')}>{t('actions.ban')}</Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={`${t(`actions.${confirmAction || 'confirm'}`)} l'utilisateur ?`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmAction(null)}>{t('actions.cancel')}</Button>
            <Button variant={confirmAction === 'ban' ? 'danger' : 'primary'} isLoading={actionLoading} onClick={handleAction}>
              {t('actions.confirm')}
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Êtes-vous sûr de vouloir {confirmAction === 'suspend' ? 'suspendre' : confirmAction === 'ban' ? 'bannir' : confirmAction === 'promote' ? 'promouvoir en admin' : confirmAction === 'demote' ? 'rétrograder' : 'activer'} {user.firstName} {user.lastName} ?
        </p>
      </Modal>
    </>
  );
}
