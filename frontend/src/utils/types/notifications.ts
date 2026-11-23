/** Параметры получения страницы уведомлений. */
export type GetNotificationsRequest = {
  limit: number;
  offset: number;
};

/** Параметры отметки уведомления прочитанным. */
export type ReadNotificationRequest = {
  id: string;
};

/** Уведомление после преобразования snake_case → camelCase в axios-перехватчике. */
export type NotificationItem = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  read: boolean;
  actionLabel: string | null;
  actionUrl: string | null;
};

export type GetNotificationsResponse = {
  /** Общее количество уведомлений для пагинации. */
  result: number;

  /** Общее число непрочитанных уведомлений. */
  unreadCount: number;

  data: NotificationItem[];
};
