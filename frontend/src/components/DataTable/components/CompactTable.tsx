import { Box, Button, Checkbox, Skeleton, Typography } from '@mui/material';

import { RowKebab } from '@/components/RowKebab';

import { DEFAULT_SORT_LABELS, SKELETON_ROWS } from '../constants';
import type { TableViewProps } from '../types';
import { ColumnHeader } from './ColumnHeader';

export function CompactTable<T>({
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
}: TableViewProps<T>) {
  const sortableColumns = columns.filter((column) => column.sortValue);

  return (
    <Box>
      {(sortableColumns.length > 0 || selectable) && (
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
                    'aria-label': 'Выбрать все видимые строки',
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
      )}

      {state === 'loading' && (
        <Box aria-label='Загрузка таблицы' aria-busy='true'>
          {Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                mb: 1,
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
            gap: 1,
          }}
        >
          {rows.map((row) => {
            const id = getRowId(row);
            const isSelected = selectedIds?.has(id) ?? false;

            return (
              <Box
                component='li'
                key={id}
                sx={{
                  minWidth: 0,
                  p: 2,
                  border: '1px solid',
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  bgcolor: isSelected ? 'action.selected' : 'background.paper',
                }}
              >
                {(selectable || kebabMenu) && (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
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
                            'aria-label': `Выбрать строку ${id}`,
                          },
                        }}
                      />
                    ) : (
                      <Box />
                    )}

                    {kebabMenu && (
                      <RowKebab actions={kebabMenu(row)} alwaysVisible />
                    )}
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
                          wordBreak: 'break-word',

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
                  <Button
                    size='small'
                    variant='text'
                    onClick={() => onRowClick(row)}
                    sx={{ mt: 1.5 }}
                  >
                    Открыть
                  </Button>
                )}
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
