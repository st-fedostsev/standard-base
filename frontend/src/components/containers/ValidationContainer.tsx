import type { ReactNode } from 'react';

import { Box, Typography } from '@mui/material';

type ValidationContainerProps = {
  children: ReactNode;
  errorText?: string;
  errorId: string;
  helperText?: string;
  helperId?: string;
  counter?: string;
  counterColor?: string;
};

export function ValidationContainer({
  children,
  errorText,
  errorId,
  helperText,
  helperId,
  counter,
  counterColor = 'text.secondary',
}: ValidationContainerProps) {
  const footerText = errorText ?? helperText;

  return (
    <Box>
      {children}

      {(footerText || counter) && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 1,
            mt: 0.5,
          }}
        >
          {footerText ? (
            <Typography
              id={errorText ? errorId : helperId}
              variant='caption'
              role={errorText ? 'alert' : undefined}
              sx={{
                minWidth: 0,
                color: errorText ? 'error.main' : 'text.secondary',
                overflowWrap: 'anywhere',
              }}
            >
              {footerText}
            </Typography>
          ) : (
            <Box />
          )}

          {counter && (
            <Typography
              variant='caption'
              sx={{
                flexShrink: 0,
                ml: 'auto',
                color: counterColor,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {counter}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
