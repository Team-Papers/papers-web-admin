import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, BookOpen, Eye, EyeOff } from 'lucide-react';
import { Header } from '@/components/organisms/Header';
import { Button } from '@/components/atoms/Button';
import { Modal } from '@/components/molecules/Modal';
import { Spinner } from '@/components/atoms/Spinner';
import { getCollections, deleteCollection, updateCollection } from '@/lib/api/collections';
import { CollectionModal } from '../components/CollectionModal';
import { CollectionBooksManager } from '../components/CollectionBooksManager';
import type { Collection } from '@/types/models';

export function CollectionsPage() {
  const { t } = useTranslation();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editCollection, setEditCollection] = useState<Collection | null>(null);
  const [booksCollection, setBooksCollection] = useState<Collection | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAll = useCallback(() => {
    setLoading(true);
    getCollections().then(setCollections).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteCollection(deleteId);
      fetchAll();
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleToggleActive = async (col: Collection) => {
    await updateCollection(col.id, { isActive: !col.isActive });
    fetchAll();
  };

  if (loading) {
    return (
      <>
        <Header title={t('nav.collections')} />
        <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>
      </>
    );
  }

  return (
    <>
      <Header title={t('nav.collections')} />
      <div className="p-6 space-y-4">
        <div className="flex justify-end">
          <Button leftIcon={<Plus size={16} />} onClick={() => setShowCreate(true)}>
            {t('actions.create')}
          </Button>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-600">Image</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Nom</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Livres</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Statut</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Ordre</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {collections.map((col) => (
                <tr key={col.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {col.imageUrl ? (
                      <img src={col.imageUrl} alt={col.name} className="h-12 w-20 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-12 w-20 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                        <BookOpen size={20} />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{col.name}</p>
                      {col.description && <p className="text-xs text-gray-500">{col.description}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{col._count?.books ?? 0}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      col.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {col.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{col.orderIndex}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setBooksCollection(col)} title="Gérer les livres">
                        <BookOpen size={14} />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleToggleActive(col)} title={col.isActive ? 'Désactiver' : 'Activer'}>
                        {col.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditCollection(col)}>
                        <Edit2 size={14} />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteId(col.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {collections.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-gray-500">
                    {t('table.noData')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CollectionModal
        isOpen={showCreate || !!editCollection}
        collection={editCollection}
        onClose={() => { setShowCreate(false); setEditCollection(null); }}
        onSuccess={() => { setShowCreate(false); setEditCollection(null); fetchAll(); }}
      />

      <CollectionBooksManager
        isOpen={!!booksCollection}
        collection={booksCollection}
        onClose={() => setBooksCollection(null)}
        onUpdate={() => {
          fetchAll();
          // Refresh the booksCollection detail
          if (booksCollection) {
            getCollections().then((cols) => {
              const updated = cols.find((c) => c.id === booksCollection.id);
              if (updated) setBooksCollection(updated);
            });
          }
        }}
      />

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Supprimer la collection ?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteId(null)}>{t('actions.cancel')}</Button>
            <Button variant="danger" isLoading={deleting} onClick={handleDelete}>{t('actions.delete')}</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">Cette action est irréversible. Les livres ne seront pas supprimés.</p>
      </Modal>
    </>
  );
}
