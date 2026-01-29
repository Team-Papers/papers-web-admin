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
  bio: string;
  status: AuthorStatus;
  rejectionReason?: string;
  totalBooks: number;
  totalRevenue: number;
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
  description: string;
  coverUrl?: string;
  price: number;
  status: BookStatus;
  rejectionReason?: string;
  authorId: string;
  author?: AuthorProfile;
  categories?: Category[];
  totalSales: number;
  createdAt: string;
  updatedAt: string;
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
