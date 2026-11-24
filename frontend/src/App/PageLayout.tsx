import type { ReactNode } from 'react';

import WarningAmberRounded from '@mui/icons-material/WarningAmberRounded';
import { Box, Button, CircularProgress, Typography } from '@mui/material';

type PageLayoutProps = {
  title: string;
  subtitle?: ReactNode;
  /** Переключатель разделов страницы под заголовком. */
  headerTabs?: ReactNode;
  actions?: ReactNode;
  filters?: ReactNode;
  children: ReactNode;

  /** Loader только в области содержимого страницы. */
  isLoading?: boolean;

  /** Error state только в области содержимого страницы. */
  isError?: boolean;
  errorTitle?: string;
  errorDescription?: string;
  onRetry?: () => void;
  isRetrying?: boolean;

  /** Empty state только в области содержимого страницы. */
  isEmpty?: boolean;
  emptyState?: ReactNode;
};

export function PageLayout({
  title,
  subtitle,
  headerTabs,
  actions,
  filters,
  children,
  isLoading = false,
  isError = false,
  errorTitle = 'Не удалось загрузить данные',
  errorDescription = 'Попробуйте повторить запрос.',
  onRetry,
  isRetrying = false,
  isEmpty = false,
  emptyState,
}: PageLayoutProps) {
  return (
    <Box
      sx={{
        width: '100%',
        minWidth: 0,
        containerType: 'inline-size',
        containerName: 'page-layout',
      }}
    >
      {/* Заголовок и действия всегда остаются видимыми. */}
      <Box
        sx={{
          display: 'grid',
          minWidth: 0,
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          gridTemplateAreas: `
            "title actions"
            "subtitle ."
          `,
          alignItems: 'center',
          columnGap: 2,
          rowGap: 0.5,

          '@container page-layout (max-width: 640px)': {
            gridTemplateColumns: 'minmax(0, 1fr)',
            gridTemplateAreas: `
              "title"
              "subtitle"
              "actions"
            `,
          },
        }}
      >
        <Typography
          component='h1'
          variant='h4'
          sx={{
            gridArea: 'title',
            minWidth: 0,
            fontFamily: 'Raleway, sans-serif',
            fontSize: '24px',
            fontWeight: 600,
            lineHeight: 1,
            letterSpacing: 0,
            color: '#000',
            textTransform: 'uppercase',
            overflowWrap: 'anywhere',
          }}
        >
          {title}
        </Typography>

        {subtitle != null && (
          <Box
            sx={{
              gridArea: 'subtitle',
              minWidth: 0,
              typography: 'body2',
              color: 'text.secondary',
              overflowWrap: 'anywhere',
            }}
          >
            {subtitle}
          </Box>
        )}

        {actions != null && (
          <Box
            sx={{
              gridArea: 'actions',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1,
              minWidth: 0,
              maxWidth: '100%',

              '& > .MuiButton-root': {
                minWidth: 0,
                maxWidth: '100%',
                whiteSpace: 'normal',
                overflowWrap: 'anywhere',
              },

              '@container page-layout (max-width: 640px)': {
                justifyContent: 'flex-start',
                mt: 1,
              },

              '@container page-layout (max-width: 420px)': {
                width: '100%',
                flexDirection: 'column',
                alignItems: 'stretch',

                '& > .MuiButton-root': {
                  width: '100%',
                  fontSize: '0.875rem',
                },
              },
            }}
          >
            {actions}
          </Box>
        )}
      </Box>

      {headerTabs != null && (
        <Box sx={{ mt: 1.5, minWidth: 0 }}>{headerTabs}</Box>
      )}

      {/* Фильтры не скрываются при пустом результате или ошибке. */}
      {filters != null && <Box sx={{ mt: 3, minWidth: 0 }}>{filters}</Box>}

      {/* Состояние меняется только в содержимом страницы. */}
      <Box sx={{ mt: 3, minWidth: 0 }}>
        {isLoading ? (
          <Box
            role='status'
            aria-live='polite'
            aria-busy='true'
            sx={{
              minHeight: 280,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
            }}
          >
            <CircularProgress size={28} />
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              Загружаем данные…
            </Typography>
          </Box>
        ) : isError ? (
          <Box
            role='alert'
            sx={{
              minHeight: 280,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              px: 2,
              textAlign: 'center',
            }}
          >
            <WarningAmberRounded
              aria-hidden='true'
              sx={{
                fontSize: 40,
                color: 'warning.main',
                mb: 0.5,
              }}
            />

            <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
              {errorTitle}
            </Typography>

            <Typography
              variant='body2'
              sx={{
                maxWidth: 420,
                color: 'text.secondary',
              }}
            >
              {errorDescription}
            </Typography>

            {onRetry && (
              <Button
                variant='outlined'
                onClick={onRetry}
                disabled={isRetrying}
                sx={{ mt: 1 }}
              >
                {isRetrying ? 'Повторяем…' : 'Повторить'}
              </Button>
            )}
          </Box>
        ) : isEmpty && emptyState != null ? (
          emptyState
        ) : (
          children
        )}
      </Box>
    </Box>
  );
}
