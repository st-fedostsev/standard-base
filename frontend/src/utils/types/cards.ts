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

export const CARD_STATUS_OPTIONS: FilterOption[] = Object.entries(
  CARD_STATUS_LABELS
).map(([value, label]) => ({ value, label }));

/** Видимость карточек и подписи для интерфейса. */
export const CARD_VISIBILITY_LABELS = {
  private: 'Приватная',
  protected: 'Защищенная',
  public: 'Публичная',
} as const;

export const CARD_VISIBILITIES = ['public', 'protected', 'private'] as const;

export type CardVisibility = (typeof CARD_VISIBILITIES)[number];

/** Автор в ответе API после преобразования snake_case → camelCase. */
export type CardAuthor = {
  id: string;
  firstName: string;
  lastName: string;
  patronymic: string | null;
};

/** Категория в ответе API. */
export type CardCategory = {
  id: string;
  name: string;
};

/** Показатель в ответе API после преобразования ключей. */
export type CardResult = {
  title: string;
  before: number;
  after: number;
  isPositive: boolean;
};

/** Показатель в запросе создания — ключи остаются в snake_case. */
export type CreateCardResult = {
  title: string;
  before: number;
  after: number;
  is_positive: boolean;
};

/** Карточка в ответе API после преобразования ключей в camelCase. */
export type CardRow = {
  id: string;
  title: string;
  industry: string;
  pilotStream: string;
  results: CardResult[];
  activities: string[];
  photo: string | null;
  category: CardCategory;
  author: CardAuthor;
  status: CardStatus;
  visibility: CardVisibility;
  createdAt: string;
};

/** Одна карточка в ответе API. */
export type CardResponse = CardRow;

/** Преобразовать категории в варианты для FilterBar. */
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

/** Тело POST /cards/get — отправляется backend в snake_case. */
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
  results: CreateCardResult[];
  activities: string[];
  category_id: string;
  visibility: CardVisibility;
};

/** Ответ POST /cards/create. */
export type CreateCardResponse = {
  msg: string;
};
