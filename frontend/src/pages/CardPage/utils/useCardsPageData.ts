import { api } from '@/utils/api';
import type {
  CardCategory,
  CardFilters,
  CardRow,
  GetCardsRequest,
} from '@/utils/types/cards';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

const PAGE_SIZE = 30;
const NO_CATEGORIES: CardCategory[] = [];

type CardsResponse =
  | CardRow[]
  | {
      result?: number;
      data: CardRow[];
    };

type CardsPage = {
  rows: CardRow[];
  totalCount?: number;
};

function normalizeCardsResponse(response: CardsResponse): CardsPage {
  if (Array.isArray(response)) {
    return {
      rows: response,
      totalCount: response.length,
    };
  }

  if (response && Array.isArray(response.data)) {
    return {
      rows: response.data,
      totalCount:
        typeof response.result === 'number'
          ? response.result
          : response.data.length,
    };
  }

  throw new Error('Неожиданный формат ответа /cards/get');
}

function createRequest(filters: CardFilters, offset: number): GetCardsRequest {
  return {
    created_from: filters.created.from || null,
    created_to: filters.created.to || null,
    title: filters.search.trim() || null,

    // API принимает одно значение. Мультивыбор остальных статусов
    // фильтруется на клиенте по загруженным страницам.
    status: filters.status.length === 1 ? filters.status[0] : null,
    category: filters.category.length === 1 ? filters.category[0] : null,

    limit: PAGE_SIZE,
    offset,
  };
}

export function useCardsPageData(filters: CardFilters) {
  const categoriesQuery = useQuery({
    queryKey: ['card-categories'],
    queryFn: ({ signal }) => api.Cards.getCategories<CardCategory[]>(signal),
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
      const response = await api.Cards.getList<CardsResponse>(request, signal);

      return normalizeCardsResponse(response);
    },

    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce(
        (sum, page) => sum + page.rows.length,
        0
      );

      if (lastPage.totalCount !== undefined) {
        return loadedCount < lastPage.totalCount ? loadedCount : undefined;
      }

      // Если backend не возвращает totalCount:
      // полная страница — проверяем следующую, неполная — конец списка.
      return lastPage.rows.length === PAGE_SIZE ? loadedCount : undefined;
    },

    meta: {
      globalLoader: true,
    },
  });

  const pages = cardsQuery.data?.pages ?? [];
  const cards = pages.flatMap((page) => page.rows);
  const categories = categoriesQuery.data ?? NO_CATEGORIES;

  const totalCount =
    pages.find((page) => page.totalCount !== undefined)?.totalCount ??
    cards.length;

  const authorsById = new Map<string, CardRow['author']>();

  for (const card of cards) {
    authorsById.set(card.author.id, card.author);
  }

  return {
    cards,
    categories,
    authors: [...authorsById.values()],
    totalCount,

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
