import type { CardAuthor, CardRow } from '@/utils/types/cards';

/** Тестовые авторы и идентификаторы вымышлены. */
const AUTHOR_IVANOV: CardAuthor = {
  id: '5f2c8a1e-3b7d-4e9a-8c61-0d4b2e7f9a13',
  firstName: 'Иван',
  lastName: 'Иванов',
};

const AUTHOR_PETROVA: CardAuthor = {
  id: '9a4e6b2d-1c8f-4a3e-b5d7-6f0e8c2a4b95',
  firstName: 'Анна',
  lastName: 'Петрова',
};

const AUTHOR_SIDOROV: CardAuthor = {
  id: 'c7d1f3e9-2b6a-4d8c-a0e5-3b9f1d7c6e24',
  firstName: 'Алексей',
  lastName: 'Сидоров',
};

const AUTHOR_KUZNETSOVA: CardAuthor = {
  id: 'd8f2b4a1-7c5e-4a9d-8b63-6e2c0f1a9b47',
  firstName: 'Мария',
  lastName: 'Кузнецова',
};

/** Временные данные для разработки интерфейса. */
export const MOCK_CARDS: CardRow[] = [
  {
    id: 'e1a7c3d9-4b2f-4f6e-9a18-7c5d0b3e2f61',
    title: 'Правила оформления материала',
    category: 'Процессы',
    author: AUTHOR_IVANOV,
    status: 'published',
    createAt: '2026-10-28T09:15:00',
    visibily: 'public',
  },
  {
    id: '2f8b5e0c-6d1a-4c7b-8e93-1a4f7d2c5b08',
    title: 'Чек-лист перед публикацией',
    category: 'Инструменты',
    author: AUTHOR_PETROVA,
    status: 'draft',
    createAt: '2026-11-02T14:40:00',
    visibily: 'public',
  },
  {
    id: '7d3c9a6f-0e5b-4b1d-a2c8-5f7e9b4d1a72',
    title: 'Сокращение времени переналадки оборудования',
    category: 'Показатели',
    author: AUTHOR_SIDOROV,
    status: 'review',
    createAt: '2026-10-30T11:05:00',
    visibily: 'public',
  },
  {
    id: 'b4e0d8a2-9f3c-4e6a-b7d1-2c8a5f0e6d39',
    title: 'Шаблон описания показателей',
    category: 'Показатели',
    author: AUTHOR_IVANOV,
    status: 'returned',
    createAt: '2026-10-21T16:20:00',
    visibily: 'public',
  },
  {
    id: '0c6f2b7e-5a9d-4d3f-8b14-9e1c7a3f5d86',
    title: 'Программа обучения новых сотрудников',
    category: 'Обучение',
    author: AUTHOR_KUZNETSOVA,
    status: 'archived',
    createAt: '2026-09-12T10:00:00',
    visibily: 'public',
  },
  {
    id: 'd9a5e1c4-7f2b-4a8e-9d6c-4b0f3e8a2c17',
    title: 'Порядок согласования правок',
    category: 'Процессы',
    author: AUTHOR_PETROVA,
    status: 'draft',
    createAt: '2026-11-03T08:30:00',
    visibily: 'public',
  },
  {
    id: 'a3c9d2e4-5b1f-4a68-8c72-9d0e3f1b6a45',
    title: 'Инструкция по использованию контрольного листа',
    category: 'Инструменты',
    author: AUTHOR_SIDOROV,
    status: 'published',
    createAt: '2026-11-05T12:00:00',
    visibily: 'public',
  },
  {
    id: 'f6e2a4b8-1d3c-4f57-9a60-2b8c4d7e1f35',
    title: 'Снижение количества дефектов на участке',
    category: 'Показатели',
    author: AUTHOR_KUZNETSOVA,
    status: 'review',
    createAt: '2026-11-07T15:25:00',
    visibily: 'public',
  },
  {
    id: '1b5d9e3f-8a2c-4d76-b019-6f4c2e8a7d53',
    title: 'Проведение вводного инструктажа',
    category: 'Обучение',
    author: AUTHOR_PETROVA,
    status: 'published',
    createAt: '2026-10-15T08:45:00',
    visibily: 'public',
  },
  {
    id: '4c7e1a9b-6f2d-4c35-a8b0-3d5e7f9a1c62',
    title: 'Организация рабочего пространства',
    category: 'Процессы',
    author: AUTHOR_IVANOV,
    status: 'returned',
    createAt: '2026-11-10T13:10:00',
    visibily: 'public',
  },
];
