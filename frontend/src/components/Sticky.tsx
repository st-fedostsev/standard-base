import type { ReactNode } from 'react';

import { Box } from '@mui/material';

type StickyProps = {
  children: ReactNode;
  side?: 'top' | 'bottom';
  offset?: number;
  className?: string;
};

export function Sticky({
  children,
  side = 'top',
  offset = 0,
  className,
}: StickyProps) {
  return (
    <Box
      className={className}
      sx={{
        position: 'sticky',
        [side]: offset,
        alignSelf: 'flex-start',
        flexShrink: 0,
      }}
    >
      {children}
    </Box>
  );
}
