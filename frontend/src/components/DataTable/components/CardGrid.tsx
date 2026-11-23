import type { ReactNode } from 'react';

import { Box, Skeleton, Typography } from '@mui/material';

import { SKELETON_ROWS } from '../constants';
import type { TableViewProps } from '../types';
import { CardItem } from './CardItem';
import { CardToolbar } from './CardToolbar';

type CardGridProps<T> = TableViewProps<T> & {
  renderCardMedia?: (row: T) => ReactNode;
};

export function CardGrid<T>({
  columns,
  rows,
  getRowId,
  sort,
  onSortChange,
  selectable,
  selectedIds,
  allSelected,
  someSelected,
  onToggleAll,
  onToggleOne,
  kebabMenu,
  onRowClick,
  state,
  errorText,
  renderCardMedia,
}: CardGridProps<T>) {
  return (
    <Box>
      <CardToolbar
        columns={columns}
        sort={sort}
        onSortChange={onSortChange}
        selectable={selectable}
        allSelected={allSelected}
        someSelected={someSelected}
        onToggleAll={onToggleAll}
        state={state}
      />

      {state === 'loading' && (
        <Box
          aria-label='Загрузка карточек'
          aria-busy='true'
          sx={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            gap: 2,
          }}
        >
          {Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <Skeleton variant='text' width='70%' />
              <Skeleton variant='text' width='90%' />
              <Skeleton variant='text' width='50%' />
            </Box>
          ))}
        </Box>
      )}

      {state === 'error' && (
        <Typography role='alert' sx={{ color: 'text.secondary', py: 3 }}>
          {errorText}
        </Typography>
      )}

      {state === 'empty' && (
        <Typography sx={{ color: 'text.secondary', py: 3 }}>
          Нет данных
        </Typography>
      )}

      {state === 'data' && (
        <Box
          component='ul'
          sx={{
            m: 0,
            p: 0,
            listStyle: 'none',
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            gap: 2,
          }}
        >
          {rows.map((row) => {
            const id = getRowId(row);

            return (
              <CardItem
                key={id}
                row={row}
                id={id}
                media={renderCardMedia?.(row)}
                columns={columns}
                selectable={selectable}
                selectedIds={selectedIds}
                onToggleOne={onToggleOne}
                kebabMenu={kebabMenu}
                onRowClick={onRowClick}
              />
            );
          })}
        </Box>
      )}
    </Box>
  );
}
