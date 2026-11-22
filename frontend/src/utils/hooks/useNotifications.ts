import { useState } from 'react';

import { api } from '@/utils/api';
import { useAuth } from '@/utils/hooks/useAuth';
import type { NotificationItem } from '@/utils/types/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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

function getUnreadCount(response: unknown): number | undefined {
  if (typeof response !== 'object' || response === null) {
    return undefined;
  }

  const data = response as Record<string, unknown>;
  const value = data.unread_count ?? data.unreadCount;

  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : undefined;
}

export function useNotifications(
  requestedPageSize: number | null,
  isPanelOpen: boolean
) {
  const queryClient = useQueryClient();

  const { user, isPending: isAuthPending, isError: isAuthError } = useAuth();

  const userId = !isAuthPending && !isAuthError ? (user?.id ?? null) : null;

  const pageSize =
    requestedPageSize === null || !Number.isFinite(requestedPageSize)
      ? null
      : Math.min(MAX_PAGE_SIZE, Math.max(0, Math.floor(requestedPageSize)));

  const [pageState, setPageState] = useState<PageState>({
    userId: null,
    pageSize: null,
    page: 0,
  });

  // Если пользователь или размер страницы изменились, сразу используем страницу 0.
  const isPageStateCurrent =
    pageState.userId === userId && pageState.pageSize === pageSize;

  const page = isPageStateCurrent ? pageState.page : 0;
  const offset = pageSize === null || pageSize === 0 ? 0 : page * pageSize;

  // Запрос нужен для счётчика на иконке, в том числе при закрытой панели.
  const summaryQuery = useQuery({
    queryKey: ['notifications', userId, 'summary'],
    queryFn: ({ signal }) =>
      api.Notifications.getList({ limit: 1, offset: 0 }, signal),
    enabled: userId !== null,
  });

  // Список запрашивается только для открытой панели.
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

  const markAllReadMutation = useMutation({
    mutationFn: async (currentUserId: string) => {
      const unreadIds = new Set<string>();
      let currentOffset = 0;

      // Получаем все страницы, чтобы отметить прочитанными все уведомления.
      while (true) {
        const response = await api.Notifications.getList({
          limit: MAX_PAGE_SIZE,
          offset: currentOffset,
        });

        response.data.forEach((notification) => {
          if (!notification.read) {
            unreadIds.add(notification.id);
          }
        });

        currentOffset += response.data.length;

        const reachedEnd =
          response.data.length === 0 ||
          response.data.length < MAX_PAGE_SIZE ||
          (typeof response.result === 'number' &&
            currentOffset >= response.result);

        if (reachedEnd) {
          break;
        }
      }

      for (const id of unreadIds) {
        await api.Notifications.markRead(id);
      }

      return {
        userId: currentUserId,
        markedCount: unreadIds.size,
      };
    },

    onSettled: async (_data, _error, currentUserId) => {
      await queryClient.invalidateQueries({
        queryKey: ['notifications', currentUserId],
      });
    },
  });

  const notifications = pageQuery.data?.data ?? EMPTY_NOTIFICATIONS;
  const unreadCount = getUnreadCount(summaryQuery.data);
  const totalCount = pageQuery.data?.result ?? summaryQuery.data?.result;

  const totalPages =
    pageSize !== null && pageSize > 0 && totalCount !== undefined
      ? Math.max(1, Math.ceil(totalCount / pageSize))
      : undefined;

  const hasPreviousPage = page > 0;

  const hasNextPage =
    pageSize !== null &&
    pageSize > 0 &&
    totalCount !== undefined &&
    offset + notifications.length < totalCount;

  const nextPage = () => {
    if (
      !hasNextPage ||
      pageQuery.isFetching ||
      userId === null ||
      pageSize === null ||
      pageSize === 0
    ) {
      return;
    }

    setPageState({
      userId,
      pageSize,
      page: page + 1,
    });
  };

  const previousPage = () => {
    if (
      !hasPreviousPage ||
      pageQuery.isFetching ||
      userId === null ||
      pageSize === null ||
      pageSize === 0
    ) {
      return;
    }

    setPageState({
      userId,
      pageSize,
      page: Math.max(0, page - 1),
    });
  };

  const markRead = async (id: string) => {
    if (!userId) {
      throw new Error('Пользователь не авторизован');
    }

    await markReadMutation.mutateAsync({ id, userId });
  };

  const markAllRead = async () => {
    if (!userId) {
      throw new Error('Пользователь не авторизован');
    }

    await markAllReadMutation.mutateAsync(userId);
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
    isFetching: pageQuery.isFetching,
    isError: pageQuery.isError,
    refetch: pageQuery.refetch,

    markRead,
    markAllRead,
    isMarkingRead: markReadMutation.isPending,
    isMarkingAllRead: markAllReadMutation.isPending,
    markReadError: markReadMutation.error,
  };
}
