import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';

import {
  Box,
  ButtonBase,
  Checkbox,
  Divider,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import RestartAlt from '@mui/icons-material/RestartAlt';

import { menuDividerSx, menuItemSx } from '@/components/Menu/menuItemSx';
import { RowKebab } from '@/components/RowKebab';

import type { ActionItem } from '@/utils/types/actions';

export type SortDir = 'asc' | 'desc';

/** Подписи пунктов меню сортировки. */
export type SortLabels = { asc: string; desc: string };

/** Готовые наборы подписей. Свои задаются прямо в колонке. */
// eslint-disable-next-line react-refresh/only-export-components
export const SORT_LABELS: Record<
  'text' | 'dateNewFirst' | 'number',
  SortLabels
> = {
  text: { asc: 'От А до Я', desc: 'От Я до А' },
  dateNewFirst: { asc: 'Сначала старые', desc: 'Сначала новые' },
  number: { asc: 'По возрастанию', desc: 'По убыванию' },
};

const DEFAULT_SORT_LABELS = SORT_LABELS.number;

export type Column<T> = {
  key: string;
  title: string;
  render: (row: T) => ReactNode;
  /** Значение для сортировки. Не задано: колонка не сортируется. */
  sortValue?: (row: T) => string | number;
  /** Подписи пунктов сортировки. Не задано: "По возрастанию" и "По убыванию" */
  sortLabels?: SortLabels;
  width?: number | string;
};

type SortState = { key: string; dir: SortDir } | null;

/** Что таблица передаёт в панель массовых действий. */
export type MassActionsContext = {
  /** Сколько строк выбрано. */
  count: number;
  /** Выбрать все видимые строки. */
  selectAll: () => void;
  /** Снять выбор. */
  clear: () => void;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  /**
   * Выбранные id. Чекбоксы появляются, только если заданы selectedIds,
   * onSelectedIdsChange и massActionsPanel.
   */
  selectedIds?: ReadonlySet<string>;
  onSelectedIdsChange?: (ids: Set<string>) => void;
  /**
   * Панель массовых действий. Выводится внизу, пока выбрана хотя бы одна
   * строка.
   */
  massActionsPanel?: (ctx: MassActionsContext) => ReactNode;
  /**
   * Меню справа в строке. Не задано: колонки нет. Пустой список для строки:
   * кнопки нет.
   */
  kebabMenu?: (row: T) => ActionItem[];
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  errorText?: string;
  /**
   * Показывается вместо таблицы, когда строк нет и данные загружены (обычно
   * EmptyState)
   */
  empty?: ReactNode;
};

const SKELETON_ROWS = 5;
/** Запас под фиксированную панель, чтобы она не закрывала последнюю строку. */
const PANEL_SPACER_PX = 96;
const KEBAB_COLUMN_WIDTH = 56;
const BODY_CELL_SX = { py: 1.5, verticalAlign: 'middle' } as const;

function compareValues(a: string | number, b: string | number): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), 'ru');
}

/**
 * Основной текст и пояснение под ним. Длинный текст обрезается, полный виден в
 * подсказке.
 */
export function CellLines({
  primary,
  secondary,
}: {
  primary: ReactNode;
  secondary?: string;
}) {
  return (
    <Box sx={{ minWidth: 0, maxWidth: 320 }}>
      <Typography
        variant='body2'
        noWrap
        title={typeof primary === 'string' ? primary : undefined}
      >
        {primary}
      </Typography>
      {secondary && (
        <Typography
          variant='caption'
          noWrap
          title={secondary}
          sx={{ display: 'block', color: 'text.secondary' }}
        >
          {secondary}
        </Typography>
      )}
    </Box>
  );
}

type ColumnHeaderProps = {
  title: string;
  /** Не задано: колонка не сортируется, заголовок выводится текстом. */
  sortLabels?: SortLabels;
  current: SortDir | null;
  onSort: (dir: SortDir | null) => void;
};

/**
 * Заголовок колонки. Сортируемый открывает меню «Сортировка». Отступ -4px
 * компенсирует внутренний padding кнопки, поэтому текст стоит на одной линии с
 * ячейками.
 */
function ColumnHeader({
  title,
  sortLabels,
  current,
  onSort,
}: ColumnHeaderProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const open = Boolean(anchor);
  const close = () => setAnchor(null);

  const textSx = {
    px: 0.5,
    mx: -0.5,
    py: 0.5,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  } as const;

  if (!sortLabels) {
    return (
      <Typography variant='body2' sx={{ ...textSx, color: 'text.secondary' }}>
        {title}
      </Typography>
    );
  }

  const pick = (dir: SortDir | null) => {
    close();
    onSort(dir);
  };

  return (
    <>
      <ButtonBase
        aria-haspopup='menu'
        aria-expanded={open}
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{
          ...textSx,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          borderRadius: 1,
          color: current || open ? 'text.primary' : 'text.secondary',
          transition: 'background-color 120ms ease, color 120ms ease',
          '&:hover': { bgcolor: 'grey.100', color: 'text.primary' },
          '&.Mui-focusVisible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: 1,
          },
        }}
      >
        <Typography component='span' variant='body2' sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <KeyboardArrowDown
          fontSize='small'
          sx={{
            transition: 'transform 150ms ease',
            transform: open ? 'rotate(180deg)' : 'none',
            opacity: current || open ? 1 : 0.5,
          }}
        />
      </ButtonBase>

      <Menu
        anchorEl={anchor}
        open={open}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: { sx: { minWidth: 220, borderRadius: 2, mt: 0.5 } },
          list: { sx: { px: 1, py: 1 } },
        }}
      >
        <ListSubheader
          disableSticky
          sx={{
            lineHeight: '32px',
            fontSize: 12,
            fontWeight: 600,
            color: 'text.secondary',
            px: 2,
          }}
        >
          Сортировка
        </ListSubheader>

        <MenuItem
          selected={current === 'asc'}
          sx={menuItemSx}
          onClick={() => pick('asc')}
        >
          <ListItemIcon>
            <ArrowUpward fontSize='small' />
          </ListItemIcon>
          <ListItemText primary={sortLabels.asc} />
        </MenuItem>

        <MenuItem
          selected={current === 'desc'}
          sx={menuItemSx}
          onClick={() => pick('desc')}
        >
          <ListItemIcon>
            <ArrowDownward fontSize='small' />
          </ListItemIcon>
          <ListItemText primary={sortLabels.desc} />
        </MenuItem>

        <Divider sx={menuDividerSx} />

        <MenuItem
          disabled={current === null}
          sx={menuItemSx}
          onClick={() => pick(null)}
        >
          <ListItemIcon>
            <RestartAlt fontSize='small' />
          </ListItemIcon>
          <ListItemText primary='Сбросить' />
        </MenuItem>
      </Menu>
    </>
  );
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  selectedIds,
  onSelectedIdsChange,
  massActionsPanel,
  kebabMenu,
  onRowClick,
  isLoading = false,
  errorText,
  empty,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState>(null);

  // Чекбоксы выводятся только если передана панель массовых действий
  const selectable =
    selectedIds !== undefined &&
    onSelectedIdsChange !== undefined &&
    massActionsPanel !== undefined;
  const columnCount =
    columns.length + (selectable ? 1 : 0) + (kebabMenu ? 1 : 0);
  const state = isLoading
    ? 'loading'
    : errorText
      ? 'error'
      : rows.length === 0
        ? 'empty'
        : 'data';

  const sortedRows = useMemo(() => {
    const column = columns.find((c) => sort && c.key === sort.key);
    const getValue = column?.sortValue;
    if (!sort || !getValue) return rows;
    const factor = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort(
      (a, b) => compareValues(getValue(a), getValue(b)) * factor
    );
  }, [rows, columns, sort]);

  // Чекбокс в шапке работает с видимыми строками
  const visibleIds = rows.map(getRowId);
  const visibleSelected = visibleIds.filter((id) =>
    selectedIds?.has(id)
  ).length;
  const allSelected = rows.length > 0 && visibleSelected === rows.length;
  const someSelected = visibleSelected > 0 && !allSelected;
  // Всего выбрано, включая строки, которых сейчас не видно
  const totalSelected = selectedIds?.size ?? 0;

  const toggleAll = () => {
    if (!onSelectedIdsChange) return;
    onSelectedIdsChange(allSelected ? new Set() : new Set(visibleIds));
  };

  const toggleOne = (id: string) => {
    if (!selectedIds || !onSelectedIdsChange) return;
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectedIdsChange(next);
  };

  // Таблица знает выбор, страница получает готовые функции
  const panelContext: MassActionsContext = {
    count: totalSelected,
    selectAll: () => onSelectedIdsChange?.(new Set(visibleIds)),
    clear: () => onSelectedIdsChange?.(new Set()),
  };

  const handleRowKeyDown =
    (row: T) => (e: KeyboardEvent<HTMLTableRowElement>) => {
      // Enter из чекбокса или кнопки внутри строки не открывает карточку
      if (e.target !== e.currentTarget) return;
      if (e.key === 'Enter' && onRowClick) onRowClick(row);
    };

  // Строк нет и данные загружены: вместо таблицы показываем пустое состояние
  if (state === 'empty' && empty) return <>{empty}</>;

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding='checkbox'>
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={toggleAll}
                    disabled={rows.length === 0}
                    slotProps={{
                      input: { 'aria-label': 'Выбрать все строки' },
                    }}
                  />
                </TableCell>
              )}

              {columns.map((column) => {
                const activeDir =
                  sort && sort.key === column.key ? sort.dir : null;
                return (
                  <TableCell
                    key={column.key}
                    sortDirection={activeDir ?? false}
                    sx={{ width: column.width, verticalAlign: 'middle' }}
                  >
                    <ColumnHeader
                      title={column.title}
                      sortLabels={
                        column.sortValue
                          ? (column.sortLabels ?? DEFAULT_SORT_LABELS)
                          : undefined
                      }
                      current={activeDir}
                      onSort={(dir) =>
                        setSort(dir ? { key: column.key, dir } : null)
                      }
                    />
                  </TableCell>
                );
              })}

              {kebabMenu && <TableCell sx={{ width: KEBAB_COLUMN_WIDTH }} />}
            </TableRow>
          </TableHead>

          <TableBody>
            {state === 'loading' &&
              Array.from({ length: SKELETON_ROWS }, (_, i) => (
                <TableRow key={i}>
                  {selectable && <TableCell padding='checkbox' />}
                  {columns.map((column) => (
                    <TableCell key={column.key} sx={BODY_CELL_SX}>
                      <Skeleton variant='text' />
                    </TableCell>
                  ))}
                  {kebabMenu && <TableCell />}
                </TableRow>
              ))}

            {state === 'error' && (
              <TableRow>
                <TableCell colSpan={columnCount} align='center' sx={{ py: 6 }}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    {errorText}
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {state === 'data' &&
              sortedRows.map((row) => {
                const id = getRowId(row);
                const isSelected = selectedIds?.has(id) ?? false;
                return (
                  <TableRow
                    key={id}
                    hover
                    selected={isSelected}
                    tabIndex={onRowClick ? 0 : undefined}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    onKeyDown={onRowClick ? handleRowKeyDown(row) : undefined}
                    sx={
                      onRowClick
                        ? {
                            cursor: 'pointer',
                            '&:focus-visible': {
                              outline: '2px solid',
                              outlineColor: 'primary.main',
                              outlineOffset: -2,
                            },
                          }
                        : undefined
                    }
                  >
                    {selectable && (
                      // Клик по чекбоксу не срабатывает как клик по строке
                      <TableCell
                        padding='checkbox'
                        sx={{ verticalAlign: 'middle' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={() => toggleOne(id)}
                          slotProps={{
                            input: { 'aria-label': 'Выбрать строку' },
                          }}
                        />
                      </TableCell>
                    )}

                    {columns.map((column) => (
                      <TableCell key={column.key} sx={BODY_CELL_SX}>
                        {column.render(row)}
                      </TableCell>
                    ))}

                    {kebabMenu && (
                      <TableCell
                        align='right'
                        sx={{ width: KEBAB_COLUMN_WIDTH, py: 0 }}
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

      {selectable && massActionsPanel && totalSelected > 0 && (
        <>
          <Box sx={{ height: PANEL_SPACER_PX }} />
          {massActionsPanel(panelContext)}
        </>
      )}
    </>
  );
}
