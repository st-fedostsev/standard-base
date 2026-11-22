import {
  Link as RouterLink,
  isRouteErrorResponse,
  useRevalidator,
  useRouteError,
} from 'react-router-dom';

import { Box, Button, Typography } from '@mui/material';
import { useId } from 'react';

function getErrorContent(error: unknown) {
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return {
        title: 'Страница не найдена',
        description: 'Проверьте адрес или вернитесь в каталог.',
      };
    }

    if (error.status === 403) {
      return {
        title: 'Недостаточно прав',
        description: 'У вашей учётной записи нет доступа к этой странице.',
      };
    }

    if (error.status === 401) {
      return {
        title: 'Требуется вход',
        description: 'Войдите в систему, чтобы открыть эту страницу.',
      };
    }
  }

  return {
    title: 'Не удалось открыть страницу',
    description: 'Попробуйте загрузить страницу ещё раз.',
  };
}

export function CircleSlashIllustration() {
  const maskId = `circle-slash-${useId().replace(/:/g, '')}`;

  return (
    <Box
      component='svg'
      viewBox='0 0 240 240'
      role='img'
      aria-label='Ссылка недоступна'
      sx={{
        display: 'block',
        width: 'min(100%, 320px)',
        height: 'auto',
        color: 'primary.main',
      }}
    >
      <defs>
        {/* Разрыв круга в местах, где его пересекает диагональ. */}
        <mask
          id={maskId}
          x='0'
          y='0'
          width='240'
          height='240'
          maskUnits='userSpaceOnUse'
        >
          <rect width='240' height='240' fill='white' />
          <line
            x1='20'
            y1='20'
            x2='220'
            y2='220'
            stroke='black'
            strokeWidth='14'
            strokeLinecap='round'
          />
        </mask>
      </defs>

      <circle
        cx='120'
        cy='120'
        r='92'
        fill='none'
        stroke='currentColor'
        strokeWidth='2.5'
        mask={`url(#${maskId})`}
      />

      <line
        x1='20'
        y1='20'
        x2='220'
        y2='220'
        stroke='currentColor'
        strokeWidth='2.5'
        strokeLinecap='round'
      />
    </Box>
  );
}

export function ErrorIllustration() {
  return (
    <Box
      component='svg'
      viewBox='0 0 240 220'
      role='img'
      aria-label='Иллюстрация ошибки'
      sx={{
        display: 'block',
        width: 'min(100%, 320px)',
        height: 'auto',
        color: 'primary.main',
      }}
    >
      <path
        d='M28 46c48 0 66 46 60 97-4 35-19 56-39 54-25-3-31-38-21-91 9-50 38-82 72-75 37 7 56 50 54 103-1 32-13 57-33 57-27 0-36-38-23-91 12-46 41-74 91-79'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeWidth='3'
      />
      <path
        d='m170 18 48 48m0-48-48 48'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeWidth='3'
      />
    </Box>
  );
}

export function GlobalRouterErrorPage() {
  const error = useRouteError();
  const revalidator = useRevalidator();
  const content = getErrorContent(error);

  return (
    <Box
      sx={{
        minHeight: '90dvh',
        boxSizing: 'border-box',
        bgcolor: '#F0F0F0',
      }}
    >
      <Box
        sx={{
          minHeight: 'calc(100dvh - 16px)',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          px: { xs: 3, sm: 5, md: 8 },
          py: { xs: 3, sm: 4, md: 5 },
          bgcolor: 'background.paper',
        }}
      >
        <Box
          component={RouterLink}
          to='/'
          aria-label='База стандартов и лучших практик — на главную'
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            width: 'fit-content',
            color: 'text.primary',
            textDecoration: 'none',
          }}
        >
          <Box
            aria-hidden='true'
            sx={{
              width: 28,
              height: 28,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 1,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            Б
          </Box>

          <Typography variant='body2' sx={{ fontWeight: 600 }}>
            База стандартов и лучших практик
          </Typography>
        </Box>

        <Box
          component='main'
          sx={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(220px, 0.9fr)',
            alignItems: 'center',
            gap: { xs: 3, md: 6 },
            py: { xs: 5, md: 8 },

            '@media (max-width: 640px)': {
              gridTemplateColumns: 'minmax(0, 1fr)',
              alignContent: 'center',
            },
          }}
        >
          <Box sx={{ minWidth: 0, maxWidth: 560 }}>
            <Typography
              component='h1'
              variant='h4'
              sx={{
                mb: 1.5,
                fontWeight: 700,
                overflowWrap: 'anywhere',
                '@media (max-width: 420px)': {
                  fontSize: '1.5rem',
                },
              }}
            >
              {content.title}
            </Typography>

            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              {content.description}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                mt: 3,
              }}
            >
              <Button
                variant='contained'
                onClick={() => revalidator.revalidate()}
                disabled={revalidator.state !== 'idle'}
              >
                {revalidator.state === 'idle' ? 'Повторить' : 'Загружаем…'}
              </Button>

              <Button component={RouterLink} to='/' variant='text'>
                На главную
              </Button>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              color: 'primary.main',

              '@media (max-width: 640px)': {
                gridRow: 2,
              },
            }}
          >
            <CircleSlashIllustration />
          </Box>
        </Box>

        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
          Если ошибка повторяется, обратитесь к администратору.
        </Typography>
      </Box>
    </Box>
  );
}
