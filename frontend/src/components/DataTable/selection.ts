export type TableSelection =
  | {
      mode: 'ids';
      ids: Set<string>;
    }
  | {
      mode: 'allMatching';
      excludedIds: Set<string>;
    };

export const createEmptySelection = (): TableSelection => ({
  mode: 'ids',
  ids: new Set(),
});

export function isRowSelected(selection: TableSelection, id: string): boolean {
  return selection.mode === 'ids'
    ? selection.ids.has(id)
    : !selection.excludedIds.has(id);
}

export function getSelectedCount(
  selection: TableSelection,
  totalMatchingCount: number
): number {
  return selection.mode === 'ids'
    ? selection.ids.size
    : Math.max(0, totalMatchingCount - selection.excludedIds.size);
}

export function toggleRow(
  selection: TableSelection,
  id: string
): TableSelection {
  if (selection.mode === 'ids') {
    const ids = new Set(selection.ids);

    if (ids.has(id)) {
      ids.delete(id);
    } else {
      ids.add(id);
    }

    return { mode: 'ids', ids };
  }

  const excludedIds = new Set(selection.excludedIds);

  if (excludedIds.has(id)) {
    excludedIds.delete(id);
  } else {
    excludedIds.add(id);
  }

  return { mode: 'allMatching', excludedIds };
}

export function toggleAllMatching(
  selection: TableSelection,
  totalMatchingCount: number
): TableSelection {
  const allMatchingSelected =
    totalMatchingCount > 0 &&
    getSelectedCount(selection, totalMatchingCount) === totalMatchingCount;

  return allMatchingSelected
    ? createEmptySelection()
    : {
        mode: 'allMatching',
        excludedIds: new Set(),
      };
}
