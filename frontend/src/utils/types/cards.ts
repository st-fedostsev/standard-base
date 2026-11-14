import type { DateRangeValue, FilterOption } from '@/utils/types/filters';

/** Статусы карточки. Набор из раздела модерации брифа, подтвердить на созвоне. */
export const CARD_STATUS_LABELS = {
  draft: 'Черновик',
  review: 'На согласовании',
  published: 'Опубликован',
  returned: 'Возвращён',
  archived: 'В архиве',
} as const;

export type CardStatus = keyof typeof CARD_STATUS_LABELS;

/** Категории. Список — моё предположение, справочник пока не согласован. */
export const CARD_CATEGORIES = [
  'Процессы',
  'Инструменты',
  'Показатели',
  'Обучение',
] as const;

export type CardCategory = (typeof CARD_CATEGORIES)[number];

export const CARD_STATUS_OPTIONS: FilterOption[] = Object.entries(
  CARD_STATUS_LABELS
).map(([value, label]) => ({ value, label }));

export const CARD_CATEGORY_OPTIONS: FilterOption[] = CARD_CATEGORIES.map(
  (c) => ({
    value: c,
    label: c,
  })
);

export type CardAuthor = {
  id: string;
  firstName: string;
  lastName: string;
};

export type CardRow = {
  id: string;
  title: string;
  category: CardCategory;
  author: CardAuthor;
  status: CardStatus;
  /** Локальное время: YYYY-MM-DDTHH:mm:ss. */
  updatedAt: string;
};

export type CardFilters = {
  search: string;
  /** Пусто: все статусы. */
  status: string[];
  /** "all": все категории. */
  category: string;
  /** "all": все авторы. */
  authorId: string;
  updated: DateRangeValue;
};

export const DEFAULT_CARD_FILTERS: CardFilters = {
  search: '',
  status: [],
  category: 'all',
  authorId: 'all',
  updated: { from: '', to: '' },
};
