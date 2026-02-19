import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload } from 'lucide-react';
import { Modal } from '@/components/molecules/Modal';
import { FormField } from '@/components/molecules/FormField';
import { Button } from '@/components/atoms/Button';
import { createArticle, updateArticle } from '@/lib/api/blog';
import { uploadCoverImage } from '@/lib/api/collections';
import type { Article } from '@/types/models';
import { ArticleStatus } from '@/types/models';

interface Props {
  isOpen: boolean;
  article: Article | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function BlogModal({ isOpen, article, onClose, onSuccess }: Props) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<string>(ArticleStatus.DRAFT);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setContent(article.content);
      setExcerpt(article.excerpt || '');
      setCoverUrl(article.coverUrl || '');
      setCategory(article.category || '');
      setStatus(article.status);
    } else {
      setTitle('');
      setContent('');
      setExcerpt('');
      setCoverUrl('');
      setCategory('');
      setStatus(ArticleStatus.DRAFT);
    }
  }, [article, isOpen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadCoverImage(file);
      setCoverUrl(url);
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
        title,
        content,
        excerpt: excerpt || undefined,
        coverUrl: coverUrl || undefined,
        category: category || undefined,
        status,
      };
      if (article) {
        await updateArticle(article.id, payload);
      } else {
        await createArticle(payload);
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
      title={article ? 'Modifier l\'article' : 'Créer un article'}
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>{t('actions.cancel')}</Button>
          <Button isLoading={loading} onClick={handleSubmit} disabled={!title.trim() || !content.trim()}>
            {t('actions.save')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField
          label="Titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={255}
        />

        <FormField
          label="Catégorie"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Ex: Technologie, Culture, ..."
        />

        <FormField
          label="Extrait"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          maxLength={500}
          placeholder="Court résumé de l'article"
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Contenu</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20"
            placeholder="Contenu de l'article..."
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Image de couverture</label>
          {coverUrl && (
            <img src={coverUrl} alt="Preview" className="mb-2 h-40 w-full rounded-lg object-cover" />
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Upload size={14} />}
            isLoading={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {coverUrl ? 'Changer l\'image' : 'Uploader une image'}
          </Button>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Statut</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20"
          >
            <option value={ArticleStatus.DRAFT}>{t('status.draft')}</option>
            <option value={ArticleStatus.PUBLISHED}>{t('status.published')}</option>
            {article && <option value={ArticleStatus.ARCHIVED}>Archivé</option>}
          </select>
        </div>
      </div>
    </Modal>
  );
}
