import type { ReactNode } from 'react';

import { Box, Typography } from '@mui/material';

type CellLinesProps = {
  primary: ReactNode;
  secondary?: string;
};

export function CellLines({ primary, secondary }: CellLinesProps) {
  return (
    <Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
      <Typography
        variant='body2'
        title={typeof primary === 'string' ? primary : undefined}
        sx={{ overflowWrap: 'anywhere' }}
      >
        {primary}
      </Typography>

      {secondary && (
        <Typography
          variant='caption'
          title={secondary}
          sx={{
            display: 'block',
            color: 'text.secondary',
            overflowWrap: 'anywhere',
          }}
        >
          {secondary}
        </Typography>
      )}
    </Box>
  );
}
