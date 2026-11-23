import {
  CARD_VISIBILITIES,
  type CardAuthor,
  type CardCategory,
  type CardRow,
  type CardStatus,
} from '@/utils/types/cards';

export const MOCK_CARD_CATEGORIES: CardCategory[] = [
  {
    id: 'cat-processes-0001',
    name: 'Процессы',
  },
  {
    id: 'cat-tools-0002',
    name: 'Инструменты',
  },
  {
    id: 'cat-indicators-0003',
    name: 'Показатели',
  },
  {
    id: 'cat-training-0004',
    name: 'Обучение',
  },
];

const AUTHORS: CardAuthor[] = [
  {
    id: '10000000-0000-4000-8000-000000000001',
    firstName: 'Степан',
    lastName: 'Федосцев',
  },
  {
    id: '10000000-0000-4000-8000-000000000002',
    firstName: 'Мария',
    lastName: 'Самойлова',
  },
  {
    id: '10000000-0000-4000-8000-000000000003',
    firstName: 'Юлиана',
    lastName: 'Тюленева',
  },
  {
    id: '10000000-0000-4000-8000-000000000004',
    firstName: 'Артем',
    lastName: 'Арасланов',
  },
  {
    id: '10000000-0000-4000-8000-000000000005',
    firstName: 'Никита',
    lastName: 'Козырчиков',
  },
];

const CARD_TITLES = [
  'Правила оформления материала',
  'Чек-лист перед публикацией',
  'Сокращение времени переналадки оборудования',
  'Шаблон описания показателей',
  'Программа обучения новых сотрудников',
  'Порядок согласования изменений',
  'Организация рабочего пространства',
  'Контроль качества на производственной линии',
  'Инструкция по передаче смены',
  'Снижение времени простоя оборудования',
];

const STATUSES: CardStatus[] = [
  'published',
  'draft',
  'review',
  'returned',
  'archived',
];

function formatMockDate(index: number): string {
  const date = new Date(
    Date.UTC(2026, 9, 1 + index, 9 + (index % 8), (index * 7) % 60)
  );

  return date.toISOString().slice(0, 19);
}

function createMockCard(index: number): CardRow {
  const category = MOCK_CARD_CATEGORIES[index % MOCK_CARD_CATEGORIES.length];
  const author = AUTHORS[index % AUTHORS.length];
  const baseTitle = CARD_TITLES[index % CARD_TITLES.length];
  const variation = Math.floor(index / CARD_TITLES.length);

  return {
    // UUID с уникальной последней частью.
    id: `20000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
    title:
      variation === 0 ? baseTitle : `${baseTitle} — пример ${variation + 1}`,
    category: category.name,
    author,
    status: STATUSES[index % STATUSES.length],
    visibily: CARD_VISIBILITIES[index % CARD_VISIBILITIES.length],
    createAt: formatMockDate(index),
  };
}

/** Тестовые карточки. Все записи и пользователи вымышлены. */
export const MOCK_CARDS: CardRow[] = Array.from({ length: 50 }, (_, index) =>
  createMockCard(index)
);
