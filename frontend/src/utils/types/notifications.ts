type NotificationBase = {
  id: string;
  title: string;
  description?: string;
  isRead: boolean;
};

/** Текстовое уведомление или уведомление с переходом внутри приложения. */
export type NotificationItem =
  | (NotificationBase & {
      type: 'text';
    })
  | (NotificationBase & {
      type: 'action';
      action: {
        label: string;
        to: string;
      };
    });
