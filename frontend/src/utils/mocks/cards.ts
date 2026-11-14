import type { CardAuthor, CardRow } from '@/utils/types/cards';

/** Все данные в этом файле используются только для разработки. */
const AUTHOR_STEPAN: CardAuthor = {
  id: '5f2c8a1e-3b7d-4e9a-8c61-0d4b2e7f9a13',
  firstName: 'Степан',
  lastName: 'Федосцев',
};

export const MOCK_CARDS: CardRow[] = [
  {
    id: 'e1a7c3d9-4b2f-4f6e-9a18-7c5d0b3e2f61',
    title: 'Правила оформления материала',
    category: 'Процессы',
    author: AUTHOR_STEPAN,
    status: 'published',
    createAt: '2026-10-28T09:15:00',
    visibily: 'public',
  },
  {
    id: '2f8b5e0c-6d1a-4c7b-8e93-1a4f7d2c5b08',
    title: 'Чек-лист перед публикацией',
    category: 'Инструменты',
    author: AUTHOR_STEPAN,
    status: 'draft',
    createAt: '2026-11-02T14:40:00',
    visibily: 'public',
  },
  {
    id: '7d3c9a6f-0e5b-4b1d-a2c8-5f7e9b4d1a72',
    title: 'Пример: сокращение времени переналадки',
    category: 'Показатели',
    author: AUTHOR_STEPAN,
    status: 'review',
    createAt: '2026-10-30T11:05:00',
    visibily: 'public',
  },
  {
    id: 'b4e0d8a2-9f3c-4e6a-b7d1-2c8a5f0e6d39',
    title: 'Шаблон описания показателей',
    category: 'Показатели',
    author: AUTHOR_STEPAN,
    status: 'returned',
    createAt: '2026-10-21T16:20:00',
    visibily: 'public',
  },
  {
    id: '0c6f2b7e-5a9d-4d3f-8b14-9e1c7a3f5d86',
    title: 'Ведение журнала обращений',
    category: 'Обучение',
    author: AUTHOR_STEPAN,
    status: 'archived',
    createAt: '2026-09-12T10:00:00',
    visibily: 'public',
  },
  {
    id: 'd9a5e1c4-7f2b-4a8e-9d6c-4b0f3e8a2c17',
    title: 'Порядок согласования правок',
    category: 'Процессы',
    author: AUTHOR_STEPAN,
    status: 'draft',
    createAt: '2026-11-03T08:30:00',
    visibily: 'public',
  },
];
