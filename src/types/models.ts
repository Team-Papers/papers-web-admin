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

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  userId: string;
  user?: { id: string; firstName: string; lastName: string; avatarUrl?: string };
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  userId: string;
  user?: User;
  bookId?: string;
  book?: Book;
  createdAt: string;
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
