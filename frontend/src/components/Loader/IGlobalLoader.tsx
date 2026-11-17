import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
} from 'react';

import { useQueryClient } from '@tanstack/react-query';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Portal,
  Typography,
  useTheme,
} from '@mui/material';

import { useAuth } from '@/utils/hooks/useAuth';

const HIDE_DELAY_MS = 120;

function usePendingInitialQueries(): number {
  const queryCache = useQueryClient().getQueryCache();

  const subscribe = useCallback(
    (notify: () => void) => queryCache.subscribe(notify),
    [queryCache]
  );

  const getSnapshot = useCallback(
    () =>
      queryCache
        .getAll()
        .filter(
          (query) =>
            query.meta?.globalLoader === true &&
            query.state.data === undefined &&
            query.state.fetchStatus === 'fetching'
        ).length,
    [queryCache]
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => 0);
}

/** Блокирует скролл страницы только пока показан полноэкранный loader. */
function useLockPageScroll(locked: boolean) {
  useLayoutEffect(() => {
    if (!locked) return;

    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;

    const previous = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
    };

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';

    return () => {
      html.style.overflow = previous.htmlOverflow;
      body.style.overflow = previous.bodyOverflow;
      body.style.position = previous.bodyPosition;
      body.style.top = previous.bodyTop;
      body.style.width = previous.bodyWidth;

      window.scrollTo(0, scrollY);
    };
  }, [locked]);
}

export function IGlobalLoader() {
  const theme = useTheme();
  const {
    isPending: isAuthPending,
    isError: isAuthError,
    retryAuth,
  } = useAuth();
  const pendingQueries = usePendingInitialQueries();

  const initialLoading = isAuthPending || pendingQueries > 0;

  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    if (initialLoadComplete || initialLoading) return;

    const timer = window.setTimeout(() => {
      setInitialLoadComplete(true);
    }, HIDE_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [initialLoadComplete, initialLoading]);

  // Loader также показывается во время входа или загрузки пользователя.
  const loaderVisible = !initialLoadComplete || isAuthPending;

  useLockPageScroll(loaderVisible);

  if (isAuthError) {
    return (
      <Portal>
        <Box
          role='alert'
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: theme.zIndex.modal + 10,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'background.paper',
            p: 3,
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            <Alert
              severity='error'
              action={
                <Button
                  color='inherit'
                  size='small'
                  onClick={() => void retryAuth()}
                >
                  Повторить
                </Button>
              }
            >
              Не удалось загрузить приложение. Проверьте соединение и попробуйте
              снова.
            </Alert>
          </Box>
        </Box>
      </Portal>
    );
  }

  if (!loaderVisible) return null;

  return (
    <Portal>
      <Box
        data-testid='global-loader'
        role='status'
        aria-live='polite'
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: theme.zIndex.modal + 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Box
          aria-hidden='true'
          sx={{
            width: 48,
            height: 48,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 2,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          Б
        </Box>

        <CircularProgress size={24} aria-label='Загрузка приложения' />

        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
          Загружаем приложение…
        </Typography>
      </Box>
    </Portal>
  );
}
