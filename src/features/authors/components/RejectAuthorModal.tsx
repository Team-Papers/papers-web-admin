import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/molecules/Modal';
import { Button } from '@/components/atoms/Button';
import { rejectAuthor } from '@/lib/api/authors';

interface Props {
  authorId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function RejectAuthorModal({ authorId, onClose, onSuccess }: Props) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!authorId || !reason.trim()) return;
    setLoading(true);
    try {
      await rejectAuthor(authorId, reason);
      setReason('');
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={!!authorId}
      onClose={onClose}
      title="Rejeter l'auteur"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>{t('actions.cancel')}</Button>
          <Button variant="danger" isLoading={loading} onClick={handleSubmit} disabled={!reason.trim()}>
            {t('actions.reject')}
          </Button>
        </>
      }
    >
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Motif du rejet..."
        className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20"
        rows={4}
        required
      />
    </Modal>
  );
}
