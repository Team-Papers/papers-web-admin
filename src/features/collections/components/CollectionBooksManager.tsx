import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Search, BookOpen } from 'lucide-react';
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

function getAuthorName(book: Book): string {
  if (book.author?.penName) return book.author.penName;
  if (book.author?.user) {
    return `${book.author.user.firstName ?? ''} ${book.author.user.lastName ?? ''}`.trim();
  }
  return '';
}

function getCategoryName(book: Book): string {
  if (!book.categories || book.categories.length === 0) return '';
  const first = book.categories[0];
  if ('category' in first && first.category) return first.category.name;
  if ('name' in first) return (first as { name: string }).name;
  return '';
}

export function CollectionBooksManager({ isOpen, collection, onClose, onUpdate }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const collectionBookIds = useMemo(
    () => new Set(collection?.books?.map((cb) => cb.bookId) || []),
    [collection?.books]
  );

  useEffect(() => {
    if (isOpen) {
      loadBooks();
    } else {
      setSearchQuery('');
      setAllBooks([]);
    }
  }, [isOpen]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const result = await getBooks({ limit: 100, status: 'PUBLISHED' });
      setAllBooks(result.data);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = useMemo(() => {
    if (!searchQuery.trim()) return allBooks;
    const q = searchQuery.toLowerCase();
    return allBooks.filter((book) => {
      const title = book.title.toLowerCase();
      const author = getAuthorName(book).toLowerCase();
      const category = getCategoryName(book).toLowerCase();
      return title.includes(q) || author.includes(q) || category.includes(q);
    });
  }, [allBooks, searchQuery]);

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
        {/* Current books in collection */}
        {collection?.books && collection.books.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-on-surface">
              Dans la collection ({collection.books.length})
            </h4>
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-outline-variant">
              {collection.books.map((cb) => (
                <div key={cb.bookId} className="flex items-center justify-between px-4 py-2 hover:bg-surface-container">
                  <div className="flex items-center gap-3">
                    {cb.book?.coverUrl ? (
                      <img src={cb.book.coverUrl} alt="" className="h-10 w-7 rounded object-cover" />
                    ) : (
                      <div className="flex h-10 w-7 items-center justify-center rounded bg-surface-container">
                        <BookOpen size={12} className="text-on-surface-variant" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-on-surface">{cb.book?.title || cb.bookId}</p>
                      <p className="text-xs text-on-surface-variant">{cb.book?.price} FCFA</p>
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
        )}

        {/* Search & available books */}
        <div>
          <h4 className="mb-2 text-sm font-semibold text-on-surface">Ajouter des livres</h4>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Filtrer par titre, auteur ou categorie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface py-2 pl-9 pr-3 text-sm text-on-surface placeholder-on-surface-variant focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="mt-2 max-h-72 space-y-1 overflow-y-auto rounded-lg border border-outline-variant">
            {loading ? (
              <p className="px-4 py-8 text-center text-sm text-on-surface-variant">Chargement...</p>
            ) : filteredBooks.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-on-surface-variant">Aucun livre trouve</p>
            ) : (
              filteredBooks.map((book) => {
                const alreadyAdded = collectionBookIds.has(book.id);
                const authorName = getAuthorName(book);
                const categoryName = getCategoryName(book);
                return (
                  <div key={book.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-surface-container">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {book.coverUrl ? (
                        <img src={book.coverUrl} alt="" className="h-12 w-8 flex-shrink-0 rounded object-cover" />
                      ) : (
                        <div className="flex h-12 w-8 flex-shrink-0 items-center justify-center rounded bg-surface-container">
                          <BookOpen size={14} className="text-on-surface-variant" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-on-surface truncate">{book.title}</p>
                        <p className="text-xs text-on-surface-variant truncate">
                          {authorName}
                          {categoryName && ` · ${categoryName}`}
                        </p>
                        <p className="text-xs text-on-surface-variant">{book.price} FCFA</p>
                      </div>
                    </div>
                    {alreadyAdded ? (
                      <span className="ml-2 flex-shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        Ajoute
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        isLoading={adding === book.id}
                        onClick={() => handleAdd(book.id)}
                        className="ml-2 flex-shrink-0"
                      >
                        <Plus size={16} className="text-primary" />
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
