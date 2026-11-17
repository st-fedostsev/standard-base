import { useMemo, useState } from 'react';

import { Box, Skeleton } from '@mui/material';

import { CardGrid } from './components/CardGrid';
import { DesktopTable } from './components/DesktopTable';
import { ViewSwitcher, type ViewMode } from './components/ViewSwitcher';
import { COMPACT_WIDTH, PANEL_SPACER_PX } from './constants';
import { useContainerWidth } from './hooks/useContainerWidth';
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
  selectedIds,
  onSelectedIdsChange,
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

  // На широкой области выбранный режим сохраняется при сужении и расширении.
  const [preferredView, setPreferredView] = useState<ViewMode>('table');

  const isCompact = width !== null && width < COMPACT_WIDTH;
  const currentView: ViewMode = isCompact ? 'cards' : preferredView;

  const selectable =
    selectedIds !== undefined &&
    onSelectedIdsChange !== undefined &&
    massActionsPanel !== undefined;

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

  const visibleIds = rows.map(getRowId);

  const visibleSelected = visibleIds.filter((id) =>
    selectedIds?.has(id)
  ).length;

  const allSelected =
    visibleIds.length > 0 && visibleSelected === visibleIds.length;

  const someSelected = visibleSelected > 0 && !allSelected;
  const totalSelected = selectedIds?.size ?? 0;

  const selectVisible = () => {
    if (!selectedIds || !onSelectedIdsChange) return;

    const next = new Set(selectedIds);

    visibleIds.forEach((id) => next.add(id));

    onSelectedIdsChange(next);
  };

  const toggleAll = () => {
    if (!selectedIds || !onSelectedIdsChange) return;

    const next = new Set(selectedIds);

    if (allSelected) {
      visibleIds.forEach((id) => next.delete(id));
    } else {
      visibleIds.forEach((id) => next.add(id));
    }

    onSelectedIdsChange(next);
  };

  const toggleOne = (id: string) => {
    if (!selectedIds || !onSelectedIdsChange) return;

    const next = new Set(selectedIds);

    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }

    onSelectedIdsChange(next);
  };

  const panelContext: MassActionsContext = {
    count: totalSelected,
    selectAll: selectVisible,
    clear: () => onSelectedIdsChange?.(new Set()),
  };

  const viewProps: TableViewProps<T> = {
    columns,
    rows: sortedRows,
    getRowId,

    sort,
    onSortChange: setSort,

    selectable,
    selectedIds,
    allSelected,
    someSelected,
    onToggleAll: toggleAll,
    onToggleOne: toggleOne,

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
      {/* Счётчик слева, переключатель вида справа */}
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
