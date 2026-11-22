import { useMemo, useState } from 'react';

import { Box, Skeleton } from '@mui/material';

import { CardGrid } from './components/CardGrid';
import { DesktopTable } from './components/DesktopTable';
import { ViewSwitcher, type ViewMode } from './components/ViewSwitcher';
import { COMPACT_WIDTH, PANEL_SPACER_PX } from './constants';
import { useContainerWidth } from './hooks/useContainerWidth';
import {
  createEmptySelection,
  getSelectedCount,
  isRowSelected,
  toggleAllMatching,
  toggleRow,
} from './selection';
import type {
  DataTableProps,
  MassActionsContext,
  SortState,
  TableState,
  TableViewProps,
} from './types';

function compareValues(a: string | number, b: string | number): number {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  return String(a).localeCompare(String(b), 'ru');
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  totalMatchingCount,
  selection,
  onSelectionChange,
  massActionsPanel,
  kebabMenu,
  onRowClick,
  renderCardMedia,
  toolbarStart,
  isLoading = false,
  errorText,
  empty,
}: DataTableProps<T>) {
  const { containerRef, width } = useContainerWidth();

  const [sort, setSort] = useState<SortState>(null);
  const [preferredView, setPreferredView] = useState<ViewMode>('table');

  const isCompact = width !== null && width < COMPACT_WIDTH;
  const currentView: ViewMode = isCompact ? 'cards' : preferredView;

  const selectable =
    onSelectionChange !== undefined && massActionsPanel !== undefined;

  const state: TableState = isLoading
    ? 'loading'
    : errorText
      ? 'error'
      : rows.length === 0
        ? 'empty'
        : 'data';

  const sortedRows = useMemo(() => {
    const column = columns.find((item) => item.key === sort?.key);
    const getValue = column?.sortValue;

    if (!sort || !getValue) {
      return rows;
    }

    const factor = sort.dir === 'asc' ? 1 : -1;

    return [...rows].sort(
      (a, b) => compareValues(getValue(a), getValue(b)) * factor
    );
  }, [rows, columns, sort]);

  // Передаём в таблицу выбранные ID только для загруженных строк.
  // Само состояние выбора хранится режимом ids/allMatching.
  const visibleSelectedIds = useMemo(() => {
    const ids = new Set<string>();

    for (const row of sortedRows) {
      const id = getRowId(row);

      if (isRowSelected(selection, id)) {
        ids.add(id);
      }
    }

    return ids;
  }, [sortedRows, getRowId, selection]);

  const totalSelected = getSelectedCount(selection, totalMatchingCount);

  // Чекбокс заголовка отражает выбор всех результатов, не только загруженных строк.
  const allSelected =
    totalMatchingCount > 0 && totalSelected === totalMatchingCount;

  const someSelected = totalSelected > 0 && !allSelected;

  const handleToggleAll = () => {
    if (!selectable) return;

    onSelectionChange(toggleAllMatching(selection, totalMatchingCount));
  };

  const handleToggleOne = (id: string) => {
    if (!selectable) return;

    onSelectionChange(toggleRow(selection, id));
  };

  const panelContext: MassActionsContext = {
    count: totalSelected,
    selectAll: handleToggleAll,
    clear: () => onSelectionChange?.(createEmptySelection()),
  };

  const viewProps: TableViewProps<T> = {
    columns,
    rows: sortedRows,
    getRowId,

    sort,
    onSortChange: setSort,

    selectable,
    selectedIds: visibleSelectedIds,
    allSelected,
    someSelected,
    onToggleAll: handleToggleAll,
    onToggleOne: handleToggleOne,

    kebabMenu,
    onRowClick,

    state,
    errorText,
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        minWidth: 0,
      }}
    >
      {width !== null && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
            minWidth: 0,
            width: '100%',
            mb: 2,
          }}
        >
          <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>{toolbarStart}</Box>

          <ViewSwitcher
            value={currentView}
            onChange={setPreferredView}
            compact={isCompact}
          />
        </Box>
      )}

      {width === null ? (
        <Skeleton variant='rounded' height={120} />
      ) : state === 'empty' && empty != null ? (
        empty
      ) : currentView === 'cards' ? (
        <CardGrid {...viewProps} renderCardMedia={renderCardMedia} />
      ) : (
        <DesktopTable {...viewProps} />
      )}

      {state === 'data' &&
        selectable &&
        massActionsPanel &&
        totalSelected > 0 && (
          <>
            <Box sx={{ height: PANEL_SPACER_PX }} />
            {massActionsPanel(panelContext)}
          </>
        )}
    </Box>
  );
}
