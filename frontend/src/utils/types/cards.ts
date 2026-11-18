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

export const CARD_VISIBILITIES = ['public', 'protected', 'private'] as const;
export type CardVisibility = (typeof CARD_VISIBILITIES)[number];

export type CardRow = {
  id: string;
  title: string;
  category: CardCategory;
  author: CardAuthor;
  status: CardStatus;
  visibily: CardVisibility;
  /** Локальное время: YYYY-MM-DDTHH:mm:ss. */
  createAt: string;
};

export type CardFilters = {
  search: string;
  status: string[];

  /** Пустой массив — все категории. */
  category: string[];

  /** Пустой массив — все авторы. */
  authorIds: string[];

  /** Период создания карточки. */
  created: DateRangeValue;
};

export const DEFAULT_CARD_FILTERS: CardFilters = {
  search: '',
  status: [],
  category: [],
  authorIds: [],
  created: {
    from: '',
    to: '',
  },
};

export type GetCardsRequest = {
  created_from?: string | null;
  created_to?: string | null;
  title?: string | null;
  status?: string | null;
  category?: string | null;
  limit: number;
  offset: number;
};

export type CreateCardStatus =
  'draft' | 'review' | 'published' | 'returned' | 'archived';

export type CreateCardVisibility = 'public' | 'protected' | 'private';

export type CreateCardRequest = {
  title: string;
  branch: string;
  pilot_stream: string;
  main_result: string;

  is_positive_result_1: boolean;
  result_old_1: string;
  result_new_1: string;

  is_positive_result_2: boolean;
  result_old_2: string;
  result_new_2: string;

  is_positive_result_3: boolean;
  result_old_3: string;
  result_new_3: string;

  event: string;
  category_id: string;
  status: CreateCardStatus;

  // Сохраняем написание поля из контракта бэкенда: visbility.
  visbility: CreateCardVisibility;
};

export type CreateCardResponse = {
  msg: string;
};
