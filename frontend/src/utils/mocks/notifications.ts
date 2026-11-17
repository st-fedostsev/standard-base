import type { NotificationItem } from '@/utils/types/notifications';

export const MOCK_NOTIFICATIONS: readonly NotificationItem[] = [
  {
    id: 'notification-1',
    type: 'text',
    title: 'Добро пожаловать',
    description: 'Регистрация успешно завершена.',
    isRead: false,
  },
  {
    id: 'notification-2',
    type: 'action',
    title: 'Карточка возвращена на доработку',
    description: 'Проверьте замечания к материалу.',
    isRead: false,
    action: {
      label: 'Перейти к карточке',
      to: '/cards/123',
    },
  },
  {
    id: 'notification-3',
    type: 'text',
    title: 'Карточка опубликована',
    description: 'Материал появился в каталоге.',
    isRead: true,
  },
];
