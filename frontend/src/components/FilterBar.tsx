import { Fragment } from 'react';

import { Box, Button, MenuItem, TextField, Typography } from '@mui/material';

import { DateRangeField } from '@/components/DateRangeField';
import { MultiSelectField } from '@/components/MultiSelectField';
import { PermissionGuard } from '@/components/PermissionGuard';
import { SearchInput } from '@/components/SearchInput';

import {
  isFiltered,
  isInvalidRange,
  type DateRangeValue,
  type FilterDef,
  type FilterValue,
  type FilterValues,
} from '@/utils/types/filters';

type FilterBarProps<T extends FilterValues> = {
  /** Описание фильтров в порядке вывода. */
  defs: FilterDef[];
  value: T;
  /** «Сбросить» возвращает эти значения. Кнопка видна, пока value отличается. */
  defaults: T;
  onChange: (next: T) => void;
  dataTid?: string;
};

const DEFAULT_SELECT_WIDTH = 200;

/**
 * Общая панель фильтров. Поля выводятся по описанию defs. Фильтр с roles скрыт
 * для остальных ролей. Это только интерфейс: данные защищает backend.
 */
export function FilterBar<T extends FilterValues>({
  defs,
  value,
  defaults,
  onChange,
  dataTid = 'filter-bar',
}: FilterBarProps<T>) {
  const read = (key: string) => value[key];
  const set = (key: string, next: FilterValue) =>
    onChange({ ...value, [key]: next } as T);

  const renderField = (def: FilterDef) => {
    switch (def.type) {
      case 'search':
        return (
          <SearchInput
            value={read(def.key) as string}
            onChange={(v) => set(def.key, v)}
            placeholder={def.placeholder}
          />
        );
      case 'select':
        return (
          <TextField
            select
            size='small'
            label={def.label}
            value={read(def.key) as string}
            onChange={(e) => set(def.key, e.target.value)}
            sx={{ width: def.width ?? DEFAULT_SELECT_WIDTH }}
          >
            <MenuItem value='all'>{def.allLabel}</MenuItem>
            {def.options.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>
        );
      case 'multiselect':
        return (
          <MultiSelectField
            label={def.label}
            options={def.options}
            value={read(def.key) as string[]}
            onChange={(v) => set(def.key, v)}
            width={def.width}
          />
        );
      case 'dateRange':
        return (
          <DateRangeField
            value={read(def.key) as DateRangeValue}
            onChange={(v) => set(def.key, v)}
            fromLabel={def.fromLabel}
            toLabel={def.toLabel}
          />
        );
    }
  };

  const hasInvalidRange = defs.some(
    (def) =>
      def.type === 'dateRange' &&
      isInvalidRange(read(def.key) as DateRangeValue)
  );

  return (
    <Box
      data-tid={dataTid}
      sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}
    >
      {defs.map((def) => {
        const field = renderField(def);
        return (
          <Fragment key={def.key}>
            {def.roles ? (
              <PermissionGuard allowed={def.roles}>{field}</PermissionGuard>
            ) : (
              field
            )}
          </Fragment>
        );
      })}

      {isFiltered(value, defaults) && (
        <Button
          variant='text'
          onClick={() => onChange(defaults)}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Сбросить
        </Button>
      )}

      {hasInvalidRange && (
        <Typography
          variant='caption'
          sx={{ width: '100%', color: 'error.main' }}
        >
          Дата начала периода позже даты окончания. Исправьте период, иначе
          список будет пуст.
        </Typography>
      )}
    </Box>
  );
}
