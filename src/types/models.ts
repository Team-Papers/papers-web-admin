export enum Role {
  USER = 'USER',
  AUTHOR = 'AUTHOR',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
}

export enum AuthorStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum BookStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PUBLISHED = 'PUBLISHED',
}

export enum TransactionType {
  SALE = 'SALE',
  WITHDRAWAL = 'WITHDRAWAL',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  status: UserStatus;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthorProfile {
  id: string;
  userId: string;
  user?: User;
  penName?: string;
  bio?: string;
  photoUrl?: string;
  website?: string;
  twitter?: string;
  facebook?: string;
  status: AuthorStatus;
  rejectionReason?: string;
  mtnNumber?: string;
  omNumber?: string;
  balance?: number;
  totalBooks?: number;
  totalRevenue?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  orderIndex: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Book {
  id: string;
  title: string;
  slug?: string;
  description: string;
  coverUrl?: string;
  fileUrl?: string;
  fileFormat?: string;
  fileSize?: number;
  pageCount?: number;
  language?: string;
  isbn?: string;
  price: number;
  status: BookStatus;
  rejectionReason?: string;
  rejectionHistory?: Array<{ reason: string; date: string }>;
  previewPercent?: number;
  publishedAt?: string;
  authorId: string;
  author?: AuthorProfile;
  categories?: Category[] | { category: Category }[];
  reviews?: Review[];
  totalSales: number;
  _count?: { purchases: number; reviews: number };
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  orderIndex: number;
  isActive: boolean;
  _count?: { books: number };
  books?: Array<{ bookId: string; orderIndex: number; book?: Book }>;
  createdAt: string;
  updatedAt: string;
}

export enum ReviewStatus {
  VISIBLE = 'VISIBLE',
  HIDDEN = 'HIDDEN',
  REPORTED = 'REPORTED',
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  status?: ReviewStatus;
  userId: string;
  user?: { id: string; email?: string; firstName: string; lastName: string; avatarUrl?: string };
  bookId?: string;
  book?: { id: string; title: string; coverUrl?: string };
  createdAt: string;
}

export interface TransactionAuthor {
  id: string;
  penName: string | null;
  photoUrl?: string | null;
  user: { id: string; firstName: string; lastName: string; email: string; avatarUrl?: string | null; role?: string; createdAt?: string };
}

export interface TransactionPurchase {
  id: string;
  amount: number;
  paymentMethod: string | null;
  paymentRef: string | null;
  status: string;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; email: string; avatarUrl?: string | null; role?: string; createdAt?: string };
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  commission?: number;
  netAmount?: number;
  reference?: string;
  status?: string;
  authorId?: string;
  author?: TransactionAuthor;
  bookId?: string;
  book?: { id: string; title: string; coverUrl?: string | null; price?: number; slug?: string };
  purchaseId?: string;
  purchase?: TransactionPurchase | null;
  userId?: string;
  user?: User;
  createdAt: string;
}

export enum ArticleStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverUrl?: string;
  category?: string;
  status: ArticleStatus;
  publishedAt?: string;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
}

export enum NotificationType {
  BOOK_APPROVED = 'BOOK_APPROVED',
  BOOK_REJECTED = 'BOOK_REJECTED',
  BOOK_SUBMITTED = 'BOOK_SUBMITTED',
  AUTHOR_APPROVED = 'AUTHOR_APPROVED',
  AUTHOR_REJECTED = 'AUTHOR_REJECTED',
  BOOK_PURCHASED = 'BOOK_PURCHASED',
  NEW_SALE = 'NEW_SALE',
  NEW_REVIEW = 'NEW_REVIEW',
  WITHDRAWAL_APPROVED = 'WITHDRAWAL_APPROVED',
  WITHDRAWAL_REJECTED = 'WITHDRAWAL_REJECTED',
  WITHDRAWAL_COMPLETED = 'WITHDRAWAL_COMPLETED',
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
  ACCOUNT_WARNING = 'ACCOUNT_WARNING',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message?: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}
