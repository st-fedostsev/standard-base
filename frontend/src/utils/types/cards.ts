import type { DateRangeValue, FilterOption } from '@/utils/types/filters';

/** Статусы карточек и подписи для интерфейса. */
export const CARD_STATUS_LABELS = {
  draft: 'Черновик',
  review: 'На согласовании',
  published: 'Опубликован',
  returned: 'Возвращён',
  archived: 'В архиве',
} as const;

export type CardStatus = keyof typeof CARD_STATUS_LABELS;

/** Варианты статуса для FilterBar. */
export const CARD_STATUS_OPTIONS: FilterOption[] = Object.entries(
  CARD_STATUS_LABELS
).map(([value, label]) => ({ value, label }));

/** Видимость карточки и подписи для интерфейса. */
export const CARD_VISIBILITY_LABELS = {
  private: 'Приватная',
  protected: 'Защищенная',
  public: 'Публичная',
} as const;

export type CardVisibility = keyof typeof CARD_VISIBILITY_LABELS;

/** Автор из ответа API карточек. */
export type CardAuthor = {
  id: string;
  first_name: string;
  last_name: string;
  patronymic: string | null;
};

/** Категория из ответа API. */
export type CardCategory = {
  id: string;
  name: string;
};

/** Показатель карточки. */
export type CardResult = {
  title: string;
  before: number;
  after: number;
  is_positive: boolean;
};

/** Карточка в ответе API. */
export type CardRow = {
  id: string;
  title: string;
  industry: string;
  pilot_stream: string;
  results: CardResult[];
  activities: string[];
  photo: string | null;
  category: CardCategory;
  author: CardAuthor;
  status: CardStatus;
  visibility: CardVisibility;
  created_at: string;
};

/** Ответ одной карточки — та же структура, что и строка таблицы. */
export type CardResponse = CardRow;

/** Категории, преобразованные в варианты для FilterBar. */
export function toCardCategoryOptions(
  categories: CardCategory[]
): FilterOption[] {
  return categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));
}

/** Фильтры списка карточек. */
export type CardFilters = {
  search: string;
  status: string[];
  category: string[];
  authorIds: string[];
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

/** Параметры POST /cards/get. */
export type GetCardsRequest = {
  created_from?: string | null;
  created_to?: string | null;
  title?: string | null;
  status?: CardStatus | null;
  category?: string | null;
  limit: number;
  offset: number;
};

/** JSON в multipart-поле `data` при создании карточки. */
export type CreateCardRequest = {
  title: string;
  industry: string;
  pilot_stream: string;
  results: CardResult[];
  activities: string[];
  category_id: string;
  visibility: CardVisibility;
};

/** Ответ POST /cards/create. */
export type CreateCardResponse = {
  msg: string;
};
