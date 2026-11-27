import type { ReactNode } from 'react';

import { Box } from '@mui/material';

type FieldRowProps = {
  /** Доля колонок. По умолчанию равные. */
  columns?: string;
  children: ReactNode;
};

/** Несколько полей в одну строку. На узком экране — в столбик. */
export function FieldRow({ columns = '1fr 1fr', children }: FieldRowProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: columns },
        alignItems: 'start',
        gap: 2,
      }}
    >
      {children}
    </Box>
  );
}
