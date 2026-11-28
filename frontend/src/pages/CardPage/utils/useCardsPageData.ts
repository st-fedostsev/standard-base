import { api } from '@/utils/api';
import {
  CARD_STATUS_LABELS,
  type CardCategory,
  type CardFilters,
  type CardRow,
  type CardStatus,
  type GetCardsRequest,
} from '@/utils/types/cards';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

const PAGE_SIZE = 30;
const NO_CATEGORIES: CardCategory[] = [];

type CardsPage = {
  rows: CardRow[];
};

function isCardStatus(value: string): value is CardStatus {
  return Object.prototype.hasOwnProperty.call(CARD_STATUS_LABELS, value);
}

/**
 * Backend ждёт datetime с таймзоной, а фильтр хранит дату как YYYY-MM-DD. Для
 * конечной даты берём конец дня, чтобы она входила в диапазон.
 */
function toIsoDateTime(date: string, endOfDay = false): string | null {
  if (!date) {
    return null;
  }

  return `${date}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}Z`;
}

function createRequest(filters: CardFilters, offset: number): GetCardsRequest {
  const selectedStatus =
    filters.status.length === 1 && isCardStatus(filters.status[0])
      ? filters.status[0]
      : null;

  return {
    created_from: toIsoDateTime(filters.created.from),
    created_to: toIsoDateTime(filters.created.to, true),
    title: filters.search.trim() || null,
    status: selectedStatus,
    category: filters.category.length === 1 ? filters.category[0] : null,
    limit: PAGE_SIZE,
    offset,
  };
}

export function useCardsPageData(filters: CardFilters) {
  const categoriesQuery = useQuery({
    queryKey: ['card-categories'],
    queryFn: ({ signal }) => api.Cards.getCategories(signal),
    meta: {
      globalLoader: true,
    },
  });

  const cardsQuery = useInfiniteQuery({
    queryKey: [
      'cards',
      {
        createdFrom: filters.created.from,
        createdTo: filters.created.to,
        title: filters.search.trim(),
        status: filters.status,
        category: filters.category,
        authorIds: filters.authorIds,
      },
    ],

    initialPageParam: 0,

    queryFn: async ({ pageParam, signal }): Promise<CardsPage> => {
      const request = createRequest(filters, pageParam);
      const rows = await api.Cards.getList(request, signal);

      return { rows };
    },

    // GET /cards/get возвращает массив без общего количества.
    // Поэтому продолжаем загрузку, пока приходит полная страница.
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.rows.length < PAGE_SIZE) {
        return undefined;
      }

      return allPages.reduce((count, page) => count + page.rows.length, 0);
    },

    meta: {
      globalLoader: true,
    },
  });

  const pages = cardsQuery.data?.pages ?? [];
  const cards = pages.flatMap((page) => page.rows);
  const categories = categoriesQuery.data ?? NO_CATEGORIES;

  const authorsById = new Map<string, CardRow['author']>();

  for (const card of cards) {
    if (card.author?.id) {
      authorsById.set(card.author.id, card.author);
    }
  }

  return {
    cards,
    categories,
    authors: [...authorsById.values()],

    // Это число уже загруженных строк, не общий count с сервера.
    totalCount: cards.length,

    hasNextPage: cardsQuery.hasNextPage ?? false,
    isInitialLoading: cardsQuery.isPending || categoriesQuery.isPending,
    isInitialError:
      (cardsQuery.isError && cards.length === 0) || categoriesQuery.isError,

    isFetchingNextPage: cardsQuery.isFetchingNextPage,
    isFetchNextPageError: cardsQuery.isFetchNextPageError,

    fetchNextPage: () =>
      cardsQuery.fetchNextPage({
        cancelRefetch: false,
      }),

    refetch: async () => {
      await Promise.all([cardsQuery.refetch(), categoriesQuery.refetch()]);
    },
  };
}
