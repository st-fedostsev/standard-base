import type { ReactNode } from 'react';

import { Box, Typography } from '@mui/material';

type ValidationContainerProps = {
  children: ReactNode;
  errorText?: string;
  errorId: string;
};

export function ValidationContainer({
  children,
  errorText,
  errorId,
}: ValidationContainerProps) {
  return (
    <Box>
      {children}

      {errorText && (
        <Typography
          id={errorId}
          variant='caption'
          role='alert'
          sx={{
            display: 'block',
            color: 'error.main',
            mt: 0.5,
          }}
        >
          {errorText}
        </Typography>
      )}
    </Box>
  );
}
