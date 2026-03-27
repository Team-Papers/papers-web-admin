import { useState } from 'react';
import { Modal } from '@/components/molecules/Modal';
import { Button } from '@/components/atoms/Button';

interface Props {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  variant?: 'danger' | 'primary';
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function ConfirmActionModal({ isOpen, title, description, confirmLabel, variant = 'danger', onClose, onConfirm }: Props) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button variant={variant} isLoading={loading} onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-on-surface-variant">{description}</p>
    </Modal>
  );
}
