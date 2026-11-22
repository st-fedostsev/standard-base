import { RowKebab } from '@/components/RowKebab';
import {
  Checkbox,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import {
  CHECKBOX_COLUMN_WIDTH,
  DEFAULT_COLUMN_WEIGHT,
  DEFAULT_SORT_LABELS,
  KEBAB_COLUMN_WIDTH,
  SKELETON_ROWS,
} from '../constants';
import type { TableViewProps } from '../types';
import { ColumnHeader } from './ColumnHeader';

const HEADER_BACKGROUND = '#1976D226';
const TABLE_TEXT_COLOR = '#242424';

const bodyCellSx = {
  py: 1.5,
  verticalAlign: 'middle',
  overflowWrap: 'anywhere',
  wordBreak: 'break-word',
  color: TABLE_TEXT_COLOR,
  fontFamily: 'Raleway, Arial, sans-serif',
  fontSize: 14,
  fontWeight: 400,
  lineHeight: '20px',
  letterSpacing: '0.15px',

  '& .MuiTypography-root': {
    color: 'inherit',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    fontWeight: 'inherit',
    lineHeight: 'inherit',
    letterSpacing: 'inherit',
  },

  '& .MuiChip-root': {
    maxWidth: '100%',
    height: 24,
    borderRadius: 12,
    fontFamily: 'Raleway, sans-serif',
    fontSize: 12,
    lineHeight: '16px',
  },

  '& .MuiChip-label': {
    px: 1,
  },

  '& .MuiChip-filled': {
    bgcolor: '#E9ECEF',
    color: '#242424',
  },

  '& .MuiChip-outlined': {
    borderColor: 'rgba(0, 0, 0, 0.16)',
    color: '#424242',
  },
} as const;

const headerCellSx = {
  py: 1.5,
  bgcolor: HEADER_BACKGROUND,
  color: TABLE_TEXT_COLOR,
  fontFamily: 'Raleway, Arial, sans-serif',
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '20px',
  letterSpacing: '0.15px',
  whiteSpace: 'nowrap',

  '& .MuiTypography-root, & .MuiButtonBase-root': {
    color: 'inherit',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    fontWeight: 'inherit',
    lineHeight: 'inherit',
    letterSpacing: 'inherit',
  },

  '& .MuiSvgIcon-root': {
    color: 'inherit',
  },
} as const;

export function DesktopTable<T>({
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
  const columnCount =
    columns.length + (selectable ? 1 : 0) + (kebabMenu ? 1 : 0);

  const reservedWidth =
    (selectable ? CHECKBOX_COLUMN_WIDTH : 0) +
    (kebabMenu ? KEBAB_COLUMN_WIDTH : 0);

  const weights = columns.map((column) =>
    typeof column.width === 'number' && column.width > 0
      ? column.width
      : DEFAULT_COLUMN_WEIGHT
  );

  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

  const columnWidth = (index: number): string | undefined => {
    if (totalWeight === 0) return undefined;

    const ratio = weights[index] / totalWeight;

    return `calc(${ratio * 100}% - ${ratio * reservedWidth}px)`;
  };

  return (
    <TableContainer
      sx={{
        width: '100%',
        minWidth: 0,
        overflowX: 'visible',
        bgcolor: '#fff',
      }}
    >
      <Table
        sx={{
          width: '100%',
          tableLayout: 'fixed',
          bgcolor: '#fff',
        }}
      >
        <colgroup>
          {selectable && <col style={{ width: CHECKBOX_COLUMN_WIDTH }} />}

          {columns.map((column, index) => (
            <col key={column.key} style={{ width: columnWidth(index) }} />
          ))}

          {kebabMenu && <col style={{ width: KEBAB_COLUMN_WIDTH }} />}
        </colgroup>

        <TableHead
          sx={{
            '& .MuiTableCell-root': {
              bgcolor: HEADER_BACKGROUND,
            },
            '& .MuiTableCell-root:hover': {
              bgcolor: HEADER_BACKGROUND,
            },
            '& .MuiTableCell-root .MuiButtonBase-root:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <TableRow>
            {selectable && (
              <TableCell padding='checkbox' sx={headerCellSx}>
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
              </TableCell>
            )}

            {columns.map((column) => {
              const activeDir = sort?.key === column.key ? sort.dir : null;

              return (
                <TableCell
                  key={column.key}
                  sortDirection={activeDir ?? false}
                  sx={{
                    ...headerCellSx,
                    verticalAlign: 'middle',
                    overflowWrap: 'anywhere',
                  }}
                >
                  <ColumnHeader
                    title={column.title}
                    sortLabels={
                      column.sortValue
                        ? (column.sortLabels ?? DEFAULT_SORT_LABELS)
                        : undefined
                    }
                    current={activeDir}
                    onSort={(direction) =>
                      onSortChange(
                        direction ? { key: column.key, dir: direction } : null
                      )
                    }
                  />
                </TableCell>
              );
            })}

            {kebabMenu && (
              <TableCell aria-label='Действия со строкой' sx={headerCellSx} />
            )}
          </TableRow>
        </TableHead>

        <TableBody>
          {state === 'loading' &&
            Array.from({ length: SKELETON_ROWS }, (_, index) => (
              <TableRow key={index}>
                {selectable && <TableCell padding='checkbox' />}

                {columns.map((column) => (
                  <TableCell key={column.key} sx={bodyCellSx}>
                    <Skeleton variant='text' />
                  </TableCell>
                ))}

                {kebabMenu && <TableCell />}
              </TableRow>
            ))}

          {state === 'error' && (
            <TableRow>
              <TableCell
                colSpan={Math.max(columnCount, 1)}
                align='center'
                sx={{ py: 6 }}
              >
                <Typography role='alert' sx={{ color: 'text.secondary' }}>
                  {errorText}
                </Typography>
              </TableCell>
            </TableRow>
          )}

          {state === 'empty' && (
            <TableRow>
              <TableCell
                colSpan={Math.max(columnCount, 1)}
                align='center'
                sx={{ py: 6 }}
              >
                <Typography sx={{ color: 'text.secondary' }}>
                  Нет данных
                </Typography>
              </TableCell>
            </TableRow>
          )}

          {state === 'data' &&
            rows.map((row) => {
              const id = getRowId(row);
              const isSelected = selectedIds?.has(id) ?? false;

              return (
                <TableRow
                  key={id}
                  hover
                  selected={selectable && isSelected}
                  tabIndex={onRowClick ? 0 : undefined}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={
                    onRowClick
                      ? (event) => {
                          // Кнопка или чекбокс внутри строки не открывают её.
                          if (event.target !== event.currentTarget) return;

                          if (event.key === 'Enter') {
                            onRowClick(row);
                          }
                        }
                      : undefined
                  }
                  sx={{
                    '& > .MuiTableCell-root': {
                      borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                    },

                    ...(onRowClick
                      ? {
                          cursor: 'pointer',
                          '&:focus-visible': {
                            outline: '2px solid',
                            outlineColor: 'primary.main',
                            outlineOffset: -2,
                          },
                        }
                      : {}),
                  }}
                >
                  {selectable && (
                    <TableCell
                      padding='checkbox'
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => onToggleOne(id)}
                        slotProps={{
                          input: {
                            'aria-label': `Выбрать строку ${id}`,
                          },
                        }}
                      />
                    </TableCell>
                  )}

                  {columns.map((column) => (
                    <TableCell key={column.key} sx={bodyCellSx}>
                      {column.render(row)}
                    </TableCell>
                  ))}

                  {kebabMenu && (
                    <TableCell
                      align='right'
                      sx={{
                        ...bodyCellSx,
                        py: 0,
                        px: 1,
                      }}
                    >
                      <RowKebab actions={kebabMenu(row)} />
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
