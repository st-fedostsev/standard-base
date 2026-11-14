import { useState } from 'react';

import { MOCK_NOTIFICATIONS } from '@/utils/mocks/notifications';
import type { NotificationItem } from '@/utils/types/notifications';

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    MOCK_NOTIFICATIONS.map((notification) => ({ ...notification }))
  );

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  /** Отметить уведомление прочитанным. */
  const markRead = (id: string) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  /** Скрыть уведомление из списка. */
  const hideNotification = (id: string) => {
    setNotifications((previous) =>
      previous.filter((notification) => notification.id !== id)
    );
  };

  return {
    notifications,
    unreadCount,
    markRead,
    hideNotification,
  };
}
