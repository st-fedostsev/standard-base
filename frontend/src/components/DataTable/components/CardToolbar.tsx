import { Box, Checkbox, Typography } from '@mui/material';

import { DEFAULT_SORT_LABELS } from '../constants';
import type { TableViewProps } from '../types';
import { ColumnHeader } from './ColumnHeader';

type CardToolbarProps<T> = Pick<
  TableViewProps<T>,
  | 'columns'
  | 'sort'
  | 'onSortChange'
  | 'selectable'
  | 'allSelected'
  | 'someSelected'
  | 'onToggleAll'
  | 'state'
>;

export function CardToolbar<T>({
  columns,
  sort,
  onSortChange,
  selectable,
  allSelected,
  someSelected,
  onToggleAll,
  state,
}: CardToolbarProps<T>) {
  const sortableColumns = columns.filter((column) => column.sortValue);

  if (!selectable && sortableColumns.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1,
        mb: 2,
      }}
    >
      {selectable && (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected}
            onChange={onToggleAll}
            disabled={state !== 'data'}
            slotProps={{
              input: {
                'aria-label': 'Выбрать все видимые карточки',
              },
            }}
          />

          <Typography variant='body2'>Выбрать все</Typography>
        </Box>
      )}

      {sortableColumns.map((column) => {
        const activeDir = sort?.key === column.key ? sort.dir : null;

        return (
          <ColumnHeader
            key={column.key}
            title={column.title}
            sortLabels={column.sortLabels ?? DEFAULT_SORT_LABELS}
            current={activeDir}
            onSort={(direction) =>
              onSortChange(
                direction ? { key: column.key, dir: direction } : null
              )
            }
          />
        );
      })}
    </Box>
  );
}
