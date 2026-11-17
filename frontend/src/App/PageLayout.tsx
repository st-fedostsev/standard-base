import type { ReactNode } from 'react';

import { Box, Typography } from '@mui/material';

type PageLayoutProps = {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  filters?: ReactNode;
  children: ReactNode;
};

export function PageLayout({
  title,
  subtitle,
  actions,
  filters,
  children,
}: PageLayoutProps) {
  return (
    <Box
      sx={{
        width: '100%',
        minWidth: 0,

        // Следим за шириной области страницы, а не всего окна.
        containerType: 'inline-size',
        containerName: 'page-layout',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          minWidth: 0,

          // Кнопки выровнены по заголовку; подзаголовок — отдельно.
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          gridTemplateAreas: `
            "title actions"
            "subtitle ."
          `,
          alignItems: 'center',
          columnGap: 2,
          rowGap: 0.5,

          // На узкой странице действия переходят под заголовок.
          '@container page-layout (max-width: 720px)': {
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
            fontWeight: 600,

            // Показываем заголовок целиком, без многоточия.
            whiteSpace: 'normal',
            overflowWrap: 'anywhere',

            '@container page-layout (max-width: 420px)': {
              fontSize: '1.5rem',
            },
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

              '@container page-layout (max-width: 720px)': {
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

      {filters != null && <Box sx={{ mt: 3, minWidth: 0 }}>{filters}</Box>}

      <Box sx={{ mt: 3, minWidth: 0 }}>{children}</Box>
    </Box>
  );
}
