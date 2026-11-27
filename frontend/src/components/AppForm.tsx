import type { FormEventHandler, ReactNode, Ref } from 'react';

import { Box } from '@mui/material';

type AppFormProps = {
  onSubmit: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
  /** Ссылка на форму: нужна, чтобы перевести фокус к первой ошибке. */
  formRef?: Ref<HTMLFormElement>;
};

export function AppForm({ onSubmit, children, formRef }: AppFormProps) {
  return (
    <Box
      component='form'
      ref={formRef}
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
