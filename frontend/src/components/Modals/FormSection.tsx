import type { ReactNode } from 'react';

import { Box, Stack, Typography } from '@mui/material';

type FormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

/** Смысловой блок формы: заголовок, подсказка и поля. */
export function FormSection({
  title,
  description,
  children,
}: FormSectionProps) {
  return (
    <Stack
      component='section'
      spacing={1.5}
      sx={{
        '&:not(:first-of-type)': {
          pt: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Box>
        <Typography component='h3' variant='subtitle2' sx={{ fontWeight: 600 }}>
          {title}
        </Typography>

        {description && (
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ display: 'block', mt: 0.25 }}
          >
            {description}
          </Typography>
        )}
      </Box>

      {children}
    </Stack>
  );
}
