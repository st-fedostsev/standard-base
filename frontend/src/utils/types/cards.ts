import type { DateRangeValue, FilterOption } from '@/utils/types/filters';

/** Статусы карточки, используемые API. */
export const CARD_STATUS_LABELS = {
  draft: 'Черновик',
  review: 'На согласовании',
  published: 'Опубликован',
  returned: 'Возвращён',
  archived: 'В архиве',
} as const;

export type CardStatus = keyof typeof CARD_STATUS_LABELS;

/** Вариант категории, возвращаемый GET /cards/categories. */
export type CardCategory = {
  id: string;
  name: string;
};

/** Преобразовать ответ API категорий в варианты для FilterBar. */
export function toCardCategoryOptions(
  categories: CardCategory[]
): FilterOption[] {
  return categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));
}

export const CARD_STATUS_OPTIONS: FilterOption[] = Object.entries(
  CARD_STATUS_LABELS
).map(([value, label]) => ({ value, label }));

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

  /** Название категории из ответа GET /cards/get. */
  category: string;

  author: CardAuthor;
  status: CardStatus;

  /** Имя visibily сохранено как в контракте API. */
  visibily: CardVisibility;

  /** Дата создания карточки. */
  createAt: string;
};

export type CardFilters = {
  search: string;
  status: string[];

  /** ID выбранных категорий; пустой массив означает «все». */
  category: string[];

  /** GUID выбранных авторов; пустой массив означает «все». */
  authorIds: string[];

  /** Диапазон даты создания карточки. */
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
