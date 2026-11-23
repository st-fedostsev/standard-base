import { Fragment } from 'react';

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
import CancelOutlined from '@mui/icons-material/CancelOutlined';
import { Box, Button, MenuItem, TextField, Typography } from '@mui/material';

import { fieldSx } from './fieldSx';

type FilterBarProps<T extends FilterValues> = {
  defs: FilterDef[];

  /** Текущие значения фильтров. */
  value: T;
  defaults: T;

  onChange: (next: T) => void;
  dataTid?: string;
};

function isFieldChanged(
  current: FilterValue | undefined,
  initial: FilterValue | undefined
): boolean {
  if (Array.isArray(current) && Array.isArray(initial)) {
    return (
      current.length !== initial.length ||
      current.some((item) => !initial.includes(item))
    );
  }

  return JSON.stringify(current) !== JSON.stringify(initial);
}

function preferredWidth(def: FilterDef): number {
  switch (def.type) {
    case 'dateRange':
      return 340;
    case 'search':
      return 280;
    case 'select':
    case 'multiselect':
      return def.width ?? 200;
  }
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
            sx={{
              ...fieldSx,
            }}
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
          const isDateRange = def.type === 'dateRange';
          const isSearch = def.type === 'search';
          const width = preferredWidth(def);

          const field = (
            <Box
              className={
                !isDateRange &&
                isFieldChanged(value[def.key], defaults[def.key])
                  ? fieldStyles.active
                  : undefined
              }
              sx={{
                /*
                 * На широком экране фильтр имеет удобный размер,
                 * не растягиваясь автоматически на всю свободную ширину.
                 */
                flex: `0 1 ${width}px`,
                width,
                minWidth: 0,
                maxWidth: '100%',

                // На узкой области один фильтр занимает всю строку.
                '@container filters (max-width: 640px)': {
                  flex: '1 1 100%',
                  width: '100%',
                },

                // Поиск остаётся шире обычных select, но не переполняет строку.
                ...(isSearch
                  ? {
                      flexBasis: Math.min(width, 360),
                    }
                  : {}),

                // Диапазон дат может перейти на всю строку раньше остальных.
                ...(isDateRange
                  ? {
                      '@container filters (max-width: 760px)': {
                        flex: '1 1 100%',
                        width: '100%',
                      },
                    }
                  : {}),
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
              whiteSpace: 'nowrap',
              textTransform: 'none',
              color: 'text.secondary',
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
