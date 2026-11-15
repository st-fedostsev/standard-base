import type { ReactNode } from 'react';

import { Box, Button, Checkbox, Typography } from '@mui/material';

import { RowKebab } from '@/components/RowKebab';

import type { TableViewProps } from '../types';

type CardItemProps<T> = Pick<
  TableViewProps<T>,
  | 'columns'
  | 'selectable'
  | 'selectedIds'
  | 'onToggleOne'
  | 'kebabMenu'
  | 'onRowClick'
> & {
  row: T;
  id: string;
  media?: ReactNode;
};

export function CardItem<T>({
  row,
  id,
  media,
  columns,
  selectable,
  selectedIds,
  onToggleOne,
  kebabMenu,
  onRowClick,
}: CardItemProps<T>) {
  const isSelected = selectable && (selectedIds?.has(id) ?? false);

  return (
    <Box
      component='li'
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: isSelected ? 'primary.main' : 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      {media != null && (
        <Box
          sx={{
            width: '100%',
            overflow: 'hidden',
          }}
        >
          {media}
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          minWidth: 0,
          p: 2,
        }}
      >
        {(selectable || kebabMenu) && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              mb: 1,
            }}
          >
            {selectable ? (
              <Checkbox
                checked={isSelected}
                onChange={() => onToggleOne(id)}
                slotProps={{
                  input: {
                    'aria-label': `Выбрать карточку ${id}`,
                  },
                }}
              />
            ) : (
              <Box />
            )}

            {kebabMenu && <RowKebab actions={kebabMenu(row)} alwaysVisible />}
          </Box>
        )}

        <Box
          component='dl'
          sx={{
            m: 0,
            display: 'grid',
            gap: 1.5,
          }}
        >
          {columns.map((column) => (
            <Box key={column.key} sx={{ minWidth: 0 }}>
              <Typography
                component='dt'
                variant='caption'
                sx={{
                  display: 'block',
                  color: 'text.secondary',
                  mb: 0.25,
                }}
              >
                {column.title}
              </Typography>

              <Box
                component='dd'
                sx={{
                  m: 0,
                  minWidth: 0,
                  overflowWrap: 'anywhere',

                  '& .MuiChip-root': {
                    maxWidth: '100%',
                  },
                }}
              >
                {column.render(row)}
              </Box>
            </Box>
          ))}
        </Box>

        {onRowClick && (
          <Box sx={{ mt: 'auto', pt: 2 }}>
            <Button size='small' variant='text' onClick={() => onRowClick(row)}>
              Открыть
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
