import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload } from 'lucide-react';
import { Modal } from '@/components/molecules/Modal';
import { FormField } from '@/components/molecules/FormField';
import { Button } from '@/components/atoms/Button';
import { createCollection, updateCollection, uploadCoverImage } from '@/lib/api/collections';
import type { Collection } from '@/types/models';

interface Props {
  isOpen: boolean;
  collection: Collection | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function CollectionModal({ isOpen, collection, onClose, onSuccess }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [order, setOrder] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (collection) {
      setName(collection.name);
      setSlug(collection.slug);
      setDescription(collection.description || '');
      setImageUrl(collection.imageUrl || '');
      setOrder(collection.orderIndex);
    } else {
      setName(''); setSlug(''); setDescription(''); setImageUrl(''); setOrder(0);
    }
  }, [collection, isOpen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadCoverImage(file);
      setImageUrl(url);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        name,
        slug,
        description: description || undefined,
        imageUrl: imageUrl || undefined,
        orderIndex: order,
      };
      if (collection) {
        await updateCollection(collection.id, payload);
      } else {
        await createCollection(payload);
      }
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={collection ? 'Modifier la collection' : 'Créer une collection'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>{t('actions.cancel')}</Button>
          <Button isLoading={loading} onClick={handleSubmit} disabled={!name.trim() || !slug.trim()}>
            {t('actions.save')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField
          label="Nom"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!collection) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
          }}
          required
        />
        <FormField label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        <FormField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Image</label>
          {imageUrl && (
            <img src={imageUrl} alt="Preview" className="mb-2 h-32 w-full rounded-lg object-cover" />
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Upload size={14} />}
            isLoading={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {imageUrl ? 'Changer l\'image' : 'Uploader une image'}
          </Button>
        </div>

        <FormField label="Ordre" type="number" value={String(order)} onChange={(e) => setOrder(Number(e.target.value))} />
      </div>
    </Modal>
  );
}
