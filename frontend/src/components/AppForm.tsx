import type { FormEventHandler, ReactNode } from 'react';

import { Box } from '@mui/material';

type AppFormProps = {
  onSubmit: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
};

export function AppForm({ onSubmit, children }: AppFormProps) {
  return (
    <Box
      component='form'
      noValidate
      onSubmit={onSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {children}
    </Box>
  );
}
