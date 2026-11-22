import { useCallback, useEffect, useRef, type ReactNode } from 'react';

import { Loader } from '@/components/Loader/Loader';
import { Box, Button, Typography } from '@mui/material';

type InfiniteScrollableProps = {
  children: ReactNode;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => Promise<unknown>;
  loadMoreError?: boolean;
  onRetry?: () => Promise<unknown>;
};

export function InfiniteScrollable({
  children,
  hasMore,
  isLoadingMore,
  onLoadMore,
  loadMoreError = false,
  onRetry,
}: InfiniteScrollableProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const requestInFlightRef = useRef(false);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  const loadNextPage = useCallback(() => {
    if (
      !hasMore ||
      loadMoreError ||
      isLoadingMore ||
      requestInFlightRef.current
    ) {
      return;
    }

    requestInFlightRef.current = true;

    void onLoadMoreRef.current().finally(() => {
      requestInFlightRef.current = false;
    });
  }, [hasMore, isLoadingMore, loadMoreError]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !hasMore || loadMoreError) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadNextPage();
        }
      },
      {
        root: null,
        rootMargin: '300px 0px',
        threshold: 0,
      }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMore, loadMoreError, loadNextPage]);

  return (
    <Box sx={{ minWidth: 0 }}>
      {children}

      {loadMoreError && (
        <Box
          role='alert'
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 1,
            py: 2,
          }}
        >
          <Typography variant='body2' color='text.secondary'>
            Не удалось загрузить следующую страницу.
          </Typography>

          {onRetry && (
            <Button
              size='small'
              onClick={() => void onRetry()}
              disabled={isLoadingMore}
            >
              Повторить
            </Button>
          )}
        </Box>
      )}

      {hasMore && !loadMoreError && (
        <Box ref={sentinelRef} aria-hidden='true' sx={{ height: 1 }} />
      )}

      {isLoadingMore && <Loader label='Загружаем ещё данные…' />}
    </Box>
  );
}
