import type { SortLabels } from './types';

/** Ниже этой ширины контейнера отображаются карточки. */
export const COMPACT_WIDTH = 800;

export const SKELETON_ROWS = 5;

/** Место под фиксированную панель массовых действий. */
export const PANEL_SPACER_PX = 96;

export const CHECKBOX_COLUMN_WIDTH = 48;
export const KEBAB_COLUMN_WIDTH = 56;
export const DEFAULT_COLUMN_WEIGHT = 200;

export const SORT_LABELS: Record<
  'text' | 'dateNewFirst' | 'number',
  SortLabels
> = {
  text: {
    asc: 'От А до Я',
    desc: 'От Я до А',
  },
  dateNewFirst: {
    asc: 'Сначала старые',
    desc: 'Сначала новые',
  },
  number: {
    asc: 'По возрастанию',
    desc: 'По убыванию',
  },
};

export const DEFAULT_SORT_LABELS = SORT_LABELS.number;
