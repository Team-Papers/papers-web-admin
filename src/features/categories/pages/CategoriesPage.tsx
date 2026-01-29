import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Header } from '@/components/organisms/Header';
import { Button } from '@/components/atoms/Button';
import { Modal } from '@/components/molecules/Modal';
import { Spinner } from '@/components/atoms/Spinner';
import { getCategories, deleteCategory } from '@/lib/api/categories';
import { CategoryModal } from '../components/CategoryModal';
import type { Category } from '@/types/models';

export function CategoriesPage() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAll = () => {
    setLoading(true);
    getCategories().then(setCategories).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteCategory(deleteId);
      fetchAll();
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const roots = categories.filter((c) => !c.parentId);

  if (loading) return <><Header title={t('nav.categories')} /><div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div></>;

  return (
    <>
      <Header title={t('nav.categories')} />
      <div className="p-6 space-y-4">
        <div className="flex justify-end">
          <Button leftIcon={<Plus size={16} />} onClick={() => setShowCreate(true)}>{t('actions.create')}</Button>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white">
          {roots.map((cat) => (
            <div key={cat.id}>
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <div>
                  <span className="font-medium text-gray-900">{cat.icon && `${cat.icon} `}{cat.name}</span>
                  {cat.description && <span className="ml-2 text-sm text-gray-500">— {cat.description}</span>}
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setEditCategory(cat)}><Edit2 size={14} /></Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteId(cat.id)}><Trash2 size={14} /></Button>
                </div>
              </div>
              {cat.children?.map((child) => (
                <div key={child.id} className="flex items-center justify-between border-b border-gray-50 bg-gray-50 px-4 py-2 pl-10">
                  <span className="text-sm text-gray-700">{child.icon && `${child.icon} `}{child.name}</span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditCategory(child)}><Edit2 size={14} /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteId(child.id)}><Trash2 size={14} /></Button>
                  </div>
                </div>
              ))}
            </div>
          ))}
          {roots.length === 0 && <p className="py-12 text-center text-sm text-gray-500">{t('table.noData')}</p>}
        </div>
      </div>

      <CategoryModal
        isOpen={showCreate || !!editCategory}
        category={editCategory}
        categories={categories}
        onClose={() => { setShowCreate(false); setEditCategory(null); }}
        onSuccess={() => { setShowCreate(false); setEditCategory(null); fetchAll(); }}
      />

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Supprimer la catégorie ?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteId(null)}>{t('actions.cancel')}</Button>
            <Button variant="danger" isLoading={deleting} onClick={handleDelete}>{t('actions.delete')}</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">Cette action est irréversible.</p>
      </Modal>
    </>
  );
}
