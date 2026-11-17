import { Fragment } from 'react';

import { Box, Button, MenuItem, TextField, Typography } from '@mui/material';
import CancelOutlined from '@mui/icons-material/CancelOutlined';

import { DateRangeField } from '@/components/DateRangeField';
import fieldStyles from '@/components/FilterField.module.css';
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
  /** Описания фильтров в порядке отображения. */
  defs: FilterDef[];

  /** Текущие значения фильтров. */
  value: T;

  /** Начальные значения, к которым возвращает кнопка сброса. */
  defaults: T;

  onChange: (next: T) => void;
  dataTid?: string;
};

const DEFAULT_SELECT_WIDTH = 200;
const SEARCH_WIDTH = 280;
const DATE_RANGE_WIDTH = 340;

/** Проверяет, изменилось ли значение относительно начального. */
function isFieldChanged(
  current: FilterValue | undefined,
  initial: FilterValue | undefined
): boolean {
  // Для множественного выбора порядок значений не важен.
  if (Array.isArray(current) && Array.isArray(initial)) {
    return (
      current.length !== initial.length ||
      current.some((item) => !initial.includes(item))
    );
  }

  return JSON.stringify(current) !== JSON.stringify(initial);
}

export function FilterBar<T extends FilterValues>({
  defs,
  value,
  defaults,
  onChange,
  dataTid = 'filter-bar',
}: FilterBarProps<T>) {
  const read = (key: string) => value[key];

  const set = (key: string, next: FilterValue) => {
    onChange({ ...value, [key]: next } as T);
  };

  const renderField = (def: FilterDef) => {
    switch (def.type) {
      case 'dateRange':
        return (
          <DateRangeField
            value={read(def.key) as DateRangeValue}
            defaultValue={defaults[def.key] as DateRangeValue}
            onChange={(next) => set(def.key, next)}
            fromLabel={def.fromLabel}
            toLabel={def.toLabel}
          />
        );

      case 'search':
        return (
          <SearchInput
            value={read(def.key) as string}
            onChange={(next) => set(def.key, next)}
            placeholder={def.placeholder}
            fullWidth
          />
        );

      case 'select':
        return (
          <TextField
            select
            fullWidth
            size='small'
            label={def.label}
            value={read(def.key) as string}
            onChange={(event) => set(def.key, event.target.value)}
          >
            <MenuItem value='all'>{def.allLabel}</MenuItem>

            {def.options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
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
            onChange={(next) => set(def.key, next)}
            searchable={def.searchable}
            active={isFieldChanged(value[def.key], defaults[def.key])}
            width='100%'
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
      sx={{
        width: '100%',
        minWidth: 0,
        containerType: 'inline-size',
        containerName: 'filters',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          gap: 1.5,
          minWidth: 0,
        }}
      >
        {defs.map((def) => {
          const preferredWidth =
            def.type === 'dateRange'
              ? DATE_RANGE_WIDTH
              : def.type === 'search'
                ? SEARCH_WIDTH
                : (def.width ?? DEFAULT_SELECT_WIDTH);

          /*
           * Даты выделяются отдельно внутри DateRangeField:
           * можно выбрать только начало или только конец периода.
           */
          const changed =
            def.type !== 'dateRange' &&
            isFieldChanged(value[def.key], defaults[def.key]);

          const field = (
            <Box
              className={changed ? fieldStyles.active : undefined}
              sx={{
                // На широком экране фильтр не растягивается.
                flex: `0 1 ${preferredWidth}px`,
                width: preferredWidth,
                maxWidth: '100%',
                minWidth: 0,

                // На узкой области каждый фильтр занимает строку.
                '@container filters (max-width: 440px)': {
                  flex: '1 1 100%',
                  width: '100%',
                },
              }}
            >
              {renderField(def)}
            </Box>
          );

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
            color='inherit'
            startIcon={<CancelOutlined fontSize='small' />}
            onClick={() => onChange(defaults)}
            sx={{
              maxWidth: '100%',
              alignSelf: 'center',
              textTransform: 'none',
            }}
          >
            Сбросить
          </Button>
        )}

        {hasInvalidRange && (
          <Typography
            variant='caption'
            sx={{
              flexBasis: '100%',
              color: 'error.main',
            }}
          >
            Дата начала периода позже даты окончания.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
