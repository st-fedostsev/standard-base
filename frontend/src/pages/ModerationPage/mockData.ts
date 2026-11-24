import type { CardRow } from '@/utils/types/cards';
import type { PendingUser } from '@/utils/types/moderation';
import { ROLES } from '@/utils/types/roles';

/** Временные данные для страницы согласования. */
export const MOCK_PENDING_USERS: PendingUser[] = [
  {
    id: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
    patronymic: null,
    email: 'john.doe@example.com',
    role: ROLES.Guest,
    avatarUrl: null,
  },
  {
    id: 'user-2',
    firstName: 'Jane',
    lastName: 'Smith',
    patronymic: null,
    email: 'jane.smith@example.com',
    role: ROLES.Guest,
    avatarUrl: null,
  },
  {
    id: 'user-3',
    firstName: 'Carlos',
    lastName: 'Ruiz',
    patronymic: null,
    email: 'carlos.ruiz@example.com',
    role: ROLES.Guest,
    avatarUrl: null,
  },
  {
    id: 'user-4',
    firstName: 'Mei',
    lastName: 'Wong',
    patronymic: null,
    email: 'mei.wong@example.com',
    role: ROLES.Guest,
    avatarUrl: null,
  },
  {
    id: 'user-5',
    firstName: 'Amina',
    lastName: 'Khalid',
    patronymic: null,
    email: 'amina.khalid@example.com',
    role: ROLES.Guest,
    avatarUrl: null,
  },
];

export const MOCK_PENDING_CARDS: CardRow[] = [
  {
    id: 'card-1',
    title: 'Оптимизация процесса согласования договоров',
    industry: 'Финансы',
    pilotStream: '12 000',
    results: [
      {
        title: 'Срок согласования',
        before: 14,
        after: 5,
        isPositive: true,
      },
    ],
    activities: [
      'Собрали рабочую группу',
      'Перевели проверку в электронный вид',
    ],
    photo: null,
    category: { id: 'category-1', name: 'Процессы' },
    author: {
      id: 'user-6',
      firstName: 'Anna',
      lastName: 'Petrova',
      patronymic: null,
    },
    status: 'review',
    visibility: 'protected',
    createdAt: '2026-11-18T10:00:00Z',
  },
  {
    id: 'card-2',
    title: 'Автоматизация ежемесячной отчётности',
    industry: 'Производство',
    pilotStream: '8 400',
    results: [
      {
        title: 'Время подготовки отчёта',
        before: 20,
        after: 6,
        isPositive: true,
      },
    ],
    activities: [
      'Собрали требования',
      'Подключили выгрузку из учётной системы',
    ],
    photo: null,
    category: { id: 'category-2', name: 'Инструменты' },
    author: {
      id: 'user-7',
      firstName: 'Ivan',
      lastName: 'Sokolov',
      patronymic: null,
    },
    status: 'review',
    visibility: 'public',
    createdAt: '2026-11-20T09:30:00Z',
  },
];
