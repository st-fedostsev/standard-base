import { useEffect, useState } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/utils/api';
import { useAuth } from '@/utils/hooks/useAuth';
import type { NotificationItem } from '@/utils/types/notifications';

const MAX_PAGE_SIZE = 20;

const EMPTY_NOTIFICATIONS: NotificationItem[] = [];

type PageState = {
  userId: string | null;
  pageSize: number | null;
  page: number;
};

type MarkReadParams = {
  id: string;
  userId: string;
};

export function useNotifications(
  requestedPageSize: number | null,
  page: number,
  isPanelOpen: boolean
) {
  const queryClient = useQueryClient();

  const { user, isPending: isAuthPending, isError: isAuthError } = useAuth();

  const userId = !isAuthPending && !isAuthError ? (user?.id ?? null) : null;

  const pageSize =
    requestedPageSize === null || !Number.isFinite(requestedPageSize)
      ? null
      : Math.min(MAX_PAGE_SIZE, Math.max(0, Math.floor(requestedPageSize)));

  // Держим страницу и pageSize вместе: если высота панели изменилась,
  // в этот рендер сразу используем первую страницу нового размера.
  const [pageState, setPageState] = useState<PageState>({
    userId: null,
    pageSize: null,
    page: 0,
  });

  const effectivePage =
    pageState.userId === userId && pageState.pageSize === pageSize ? page : 0;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPageState((previous) => {
      if (
        previous.userId === userId &&
        previous.pageSize === pageSize &&
        previous.page === page
      ) {
        return previous;
      }

      const sameUserAndSize =
        previous.userId === userId && previous.pageSize === pageSize;

      return {
        userId,
        pageSize,
        page: sameUserAndSize ? page : 0,
      };
    });
  }, [userId, pageSize, page]);

  const offset =
    pageSize === null || pageSize === 0 ? 0 : effectivePage * pageSize;

  // Небольшой запрос нужен для счётчика на значке, даже при закрытой панели.
  const summaryQuery = useQuery({
    queryKey: ['notifications', userId, 'summary'],
    queryFn: ({ signal }) =>
      api.Notifications.getList({ limit: 1, offset: 0 }, signal),
    enabled: userId !== null,
  });

  // Список запрашивается только для открытой панели и вычисленного pageSize.
  const pageQuery = useQuery({
    queryKey: ['notifications', userId, 'page', pageSize, offset],
    queryFn: async ({ signal }) => {
      if (pageSize === null || pageSize === 0) {
        throw new Error('В панели недостаточно места для уведомлений');
      }

      const response = await api.Notifications.getList(
        { limit: pageSize, offset },
        signal
      );

      // Защита от ответа длиннее выделенного места в панели.
      return {
        ...response,
        data: response.data.slice(0, pageSize),
      };
    },
    enabled:
      userId !== null && isPanelOpen && pageSize !== null && pageSize > 0,
  });

  const markReadMutation = useMutation({
    mutationFn: ({ id }: MarkReadParams) => api.Notifications.markRead(id),

    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['notifications', variables.userId],
      });
    },
  });

  const notifications = pageQuery.data?.data ?? EMPTY_NOTIFICATIONS;
  const unreadCount = summaryQuery.data?.unreadCount;
  const totalCount = pageQuery.data?.result ?? summaryQuery.data?.result;

  const totalPages =
    pageSize !== null && pageSize > 0 && totalCount !== undefined
      ? Math.max(1, Math.ceil(totalCount / pageSize))
      : undefined;

  const hasPreviousPage = effectivePage > 0;

  const hasNextPage =
    pageSize !== null &&
    pageSize > 0 &&
    totalCount !== undefined &&
    offset + notifications.length < totalCount;

  const nextPage = () => {
    if (!hasNextPage || pageQuery.isLoading) return;

    setPageState({
      userId,
      pageSize,
      page: effectivePage + 1,
    });
  };

  const previousPage = () => {
    if (!hasPreviousPage || pageQuery.isLoading || pageSize === null) return;

    setPageState({
      userId,
      pageSize,
      page: Math.max(0, effectivePage - 1),
    });
  };

  const markRead = async (id: string) => {
    if (!userId) {
      throw new Error('Пользователь не авторизован');
    }

    await markReadMutation.mutateAsync({ id, userId });
  };

  return {
    notifications,
    unreadCount,
    totalCount,
    totalPages,

    page,
    pageSize,
    hasPreviousPage,
    hasNextPage,
    nextPage,
    previousPage,

    isLoading:
      userId !== null &&
      isPanelOpen &&
      pageSize !== null &&
      pageSize > 0 &&
      pageQuery.isLoading,
    isError: pageQuery.isError,
    refetch: pageQuery.refetch,

    markRead,
    isMarkingRead: markReadMutation.isPending,
    markReadError: markReadMutation.error,
  };
}
