import { useState, useEffect } from 'react';
import { Plus, Trash2, Search } from 'lucide-react';
import { Modal } from '@/components/molecules/Modal';
import { Button } from '@/components/atoms/Button';
import { getBooks } from '@/lib/api/books';
import { addBookToCollection, removeBookFromCollection } from '@/lib/api/collections';
import type { Collection, Book } from '@/types/models';

interface Props {
  isOpen: boolean;
  collection: Collection | null;
  onClose: () => void;
  onUpdate: () => void;
}

export function CollectionBooksManager({ isOpen, collection, onClose, onUpdate }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const collectionBookIds = new Set(collection?.books?.map((cb) => cb.bookId) || []);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [isOpen]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const result = await getBooks({ search: searchQuery, limit: 20, status: 'PUBLISHED' });
      setSearchResults(result.data);
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = async (bookId: string) => {
    if (!collection) return;
    setAdding(bookId);
    try {
      await addBookToCollection(collection.id, bookId);
      onUpdate();
    } finally {
      setAdding(null);
    }
  };

  const handleRemove = async (bookId: string) => {
    if (!collection) return;
    setRemoving(bookId);
    try {
      await removeBookFromCollection(collection.id, bookId);
      onUpdate();
    } finally {
      setRemoving(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Livres — ${collection?.name || ''}`}
      size="lg"
      footer={
        <Button variant="secondary" onClick={onClose}>Fermer</Button>
      }
    >
      <div className="space-y-4">
        {/* Current books */}
        <div>
          <h4 className="mb-2 text-sm font-semibold text-gray-700">
            Livres dans la collection ({collection?.books?.length || 0})
          </h4>
          <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-gray-200">
            {collection?.books?.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-gray-500">Aucun livre dans cette collection</p>
            )}
            {collection?.books?.map((cb) => (
              <div key={cb.bookId} className="flex items-center justify-between px-4 py-2 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  {cb.book?.coverUrl && (
                    <img src={cb.book.coverUrl} alt="" className="h-10 w-7 rounded object-cover" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{cb.book?.title || cb.bookId}</p>
                    <p className="text-xs text-gray-500">{cb.book?.price} FCFA</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  isLoading={removing === cb.bookId}
                  onClick={() => handleRemove(cb.bookId)}
                >
                  <Trash2 size={14} className="text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Search & add */}
        <div>
          <h4 className="mb-2 text-sm font-semibold text-gray-700">Ajouter des livres</h4>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un livre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <Button size="sm" isLoading={searching} onClick={handleSearch}>Chercher</Button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-lg border border-gray-200">
              {searchResults.map((book) => {
                const alreadyAdded = collectionBookIds.has(book.id);
                return (
                  <div key={book.id} className="flex items-center justify-between px-4 py-2 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      {book.coverUrl && (
                        <img src={book.coverUrl} alt="" className="h-10 w-7 rounded object-cover" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{book.title}</p>
                        <p className="text-xs text-gray-500">{book.price} FCFA</p>
                      </div>
                    </div>
                    {alreadyAdded ? (
                      <span className="text-xs text-gray-400">Déjà ajouté</span>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        isLoading={adding === book.id}
                        onClick={() => handleAdd(book.id)}
                      >
                        <Plus size={14} className="text-primary-500" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
