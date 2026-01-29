import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/molecules/Modal';
import { FormField } from '@/components/molecules/FormField';
import { Button } from '@/components/atoms/Button';
import { createCategory, updateCategory } from '@/lib/api/categories';
import type { Category } from '@/types/models';

interface Props {
  isOpen: boolean;
  category: Category | null;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

export function CategoryModal({ isOpen, category, categories, onClose, onSuccess }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [icon, setIcon] = useState('');
  const [order, setOrder] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setDescription(category.description || '');
      setParentId(category.parentId || '');
      setIcon(category.icon || '');
      setOrder(category.orderIndex);
    } else {
      setName(''); setSlug(''); setDescription(''); setParentId(''); setIcon(''); setOrder(0);
    }
  }, [category, isOpen]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = { name, slug, description: description || undefined, parentId: parentId || null, icon: icon || undefined, orderIndex: order };
      if (category) {
        await updateCategory(category.id, payload);
      } else {
        await createCategory(payload);
      }
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  const roots = categories.filter((c) => !c.parentId && c.id !== category?.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? 'Modifier la catégorie' : 'Créer une catégorie'}
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
        <FormField label="Nom" value={name} onChange={(e) => { setName(e.target.value); if (!category) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')); }} required />
        <FormField label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        <FormField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Catégorie parente</label>
          <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={parentId} onChange={(e) => setParentId(e.target.value)}>
            <option value="">Aucune (racine)</option>
            {roots.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <FormField label="Icône" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="emoji ou nom d'icône" />
        <FormField label="Ordre" type="number" value={String(order)} onChange={(e) => setOrder(Number(e.target.value))} />
      </div>
    </Modal>
  );
}
