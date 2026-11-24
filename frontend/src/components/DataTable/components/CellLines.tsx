import type { ReactNode } from 'react';

import { TruncatedText } from '@/components/TruncatedText';
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
        <TruncatedText
          value={secondary}
          variant='caption'
          color='text.secondary'
          alwaysShowTooltip
        />
      )}
    </Box>
  );
}
