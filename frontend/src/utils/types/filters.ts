import type { Role } from '@/utils/types/roles';

export type FilterOption = { value: string; label: string };

export type DateRangeValue = {
  /** YYYY-MM-DD, пусто: не задано. */
  from: string;
  to: string;
};

export type FilterValue = string | string[] | DateRangeValue;

/** Значения панели фильтров. Ключи совпадают с key в описаниях фильтров. */
export type FilterValues = Record<string, FilterValue>;

type FilterBase = {
  /** Ключ в объекте значений. */
  key: string;
  /** Кто видит фильтр. Не задано: все. */
  roles?: readonly Role[];
};

/** Описание одного фильтра. Порядок в массиве задаёт порядок на панели. */
export type FilterDef =
  | (FilterBase & { type: 'search'; placeholder: string })
  | (FilterBase & {
      type: 'select';
      label: string;
      allLabel: string;
      options: readonly FilterOption[];
      width?: number;
    })
  | (FilterBase & {
      type: 'multiselect';
      label: string;
      options: readonly FilterOption[];
      width?: number;
    })
  | (FilterBase & { type: 'dateRange'; fromLabel: string; toLabel: string });

/** Есть ли отличия от значений по умолчанию. */
export function isFiltered<T extends FilterValues>(
  value: T,
  defaults: T
): boolean {
  return Object.keys(defaults).some(
    (key) => JSON.stringify(value[key]) !== JSON.stringify(defaults[key])
  );
}

/** Дата начала позже даты окончания: список тогда пуст. */
export function isInvalidRange(range: DateRangeValue): boolean {
  return range.from !== '' && range.to !== '' && range.from > range.to;
}
