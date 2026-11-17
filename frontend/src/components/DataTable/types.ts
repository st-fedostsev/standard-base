import type { ReactNode } from 'react';

import type { ActionItem } from '@/utils/types/actions';

export type SortDir = 'asc' | 'desc';

export type SortLabels = {
  asc: string;
  desc: string;
};

export type Column<T> = {
  key: string;
  title: string;
  render: (row: T) => ReactNode;

  /** Если значение не задано, колонка не сортируется. */
  sortValue?: (row: T) => string | number;

  sortLabels?: SortLabels;

  /**
   * Числовое значение используется как относительный вес колонки. Строковое
   * сохраняется для совместимости, но пока не учитывается.
   */
  width?: number | string;
};

export type SortState = {
  key: string;
  dir: SortDir;
} | null;

export type MassActionsContext = {
  /** Все выбранные ID, включая скрытые фильтром. */
  count: number;

  /** Добавить к выбору все видимые строки. */
  selectAll: () => void;

  /** Снять весь выбор. */
  clear: () => void;
};

export type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;

  /** Содержимое слева от переключателя вида, например счётчик. */
  toolbarStart?: ReactNode;

  /**
   * Необязательное изображение или другой блок в верхней части карточки.
   * Показывается только в карточном представлении.
   */
  renderCardMedia?: (row: T) => ReactNode;

  selectedIds?: ReadonlySet<string>;
  onSelectedIdsChange?: (ids: Set<string>) => void;
  massActionsPanel?: (context: MassActionsContext) => ReactNode;

  kebabMenu?: (row: T) => ActionItem[];
  onRowClick?: (row: T) => void;

  isLoading?: boolean;
  errorText?: string;
  empty?: ReactNode;
};

export type TableState = 'loading' | 'error' | 'empty' | 'data';

/** Общие данные, необходимые табличному и компактному представлению. */
export type TableViewProps<T> = {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;

  sort: SortState;
  onSortChange: (sort: SortState) => void;

  selectable: boolean;
  selectedIds?: ReadonlySet<string>;
  allSelected: boolean;
  someSelected: boolean;
  onToggleAll: () => void;
  onToggleOne: (id: string) => void;

  kebabMenu?: (row: T) => ActionItem[];
  onRowClick?: (row: T) => void;

  state: TableState;
  errorText?: string;
};
