import { useState } from 'react';
import { Modal } from '@/components/molecules/Modal';
import { Button } from '@/components/atoms/Button';
import { suspendBook } from '@/lib/api/books';

interface Props {
  bookId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function SuspendBookModal({ bookId, onClose, onSuccess }: Props) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!bookId || !reason.trim()) return;
    setLoading(true);
    try {
      await suspendBook(bookId, reason);
      setReason('');
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={!!bookId}
      onClose={onClose}
      title="Suspendre le livre"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button variant="danger" isLoading={loading} onClick={handleSubmit} disabled={!reason.trim()}>
            Suspendre
          </Button>
        </>
      }
    >
      <p className="text-sm text-on-surface-muted mb-3">
        Ce livre ne sera plus visible dans l'application mobile. L'auteur sera notifié avec le motif de suspension.
      </p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Motif de la suspension (obligatoire)..."
        className="w-full rounded-md border border-outline-variant bg-surface text-on-surface p-3 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20"
        rows={4}
        required
      />
    </Modal>
  );
}
