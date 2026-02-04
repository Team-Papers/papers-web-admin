import { useRef, useEffect } from 'react';
import { Bell, Check, Trash2, X, BookOpen, Star, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { useNotifications } from '@/lib/hooks/useNotifications';
import type { Notification, NotificationType } from '@/types/models';
import { cn } from '@/lib/utils/cn';

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'BOOK_APPROVED':
    case 'AUTHOR_APPROVED':
    case 'WITHDRAWAL_APPROVED':
    case 'WITHDRAWAL_COMPLETED':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'BOOK_REJECTED':
    case 'AUTHOR_REJECTED':
    case 'WITHDRAWAL_REJECTED':
      return <X className="w-5 h-5 text-red-500" />;
    case 'NEW_SALE':
    case 'BOOK_PURCHASED':
      return <DollarSign className="w-5 h-5 text-blue-500" />;
    case 'NEW_REVIEW':
      return <Star className="w-5 h-5 text-amber-500" />;
    case 'BOOK_SUBMITTED':
      return <BookOpen className="w-5 h-5 text-purple-500" />;
    case 'SYSTEM_ANNOUNCEMENT':
    case 'ACCOUNT_WARNING':
      return <AlertCircle className="w-5 h-5 text-amber-500" />;
    default:
      return <Bell className="w-5 h-5 text-gray-500" />;
  }
}

function formatTimeAgo(date: string) {
  const now = new Date();
  const notificationDate = new Date(date);
  const diffMs = now.getTime() - notificationDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours} h`;
  if (diffDays < 7) return `Il y a ${diffDays} j`;
  return notificationDate.toLocaleDateString('fr-FR');
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group',
        !notification.read && 'bg-blue-50/50',
      )}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getNotificationIcon(notification.type as NotificationType)}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm text-gray-900', !notification.read && 'font-semibold')}>
          {notification.title}
        </p>
        {notification.message && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
            {notification.message}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          {formatTimeAgo(notification.createdAt)}
        </p>
      </div>
      <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.read && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title="Marquer comme lu"
          >
            <Check className="w-4 h-4 text-gray-500" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          className="p-1 hover:bg-red-50 rounded"
          title="Supprimer"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>
    </div>
  );
}

export function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    isLoading,
    isOpen,
    setIsOpen,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
  } = useNotifications();

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, setIsOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ''}`}
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 max-h-[70vh] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:underline"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(70vh-100px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <Bell className="w-12 h-12 mb-2 opacity-50" />
                <p className="text-sm">Aucune notification</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.some((n) => n.read) && (
            <div className="border-t border-gray-100 px-4 py-2">
              <button
                onClick={clearReadNotifications}
                className="text-xs text-gray-500 hover:text-red-500 transition-colors"
              >
                Effacer les notifications lues
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
