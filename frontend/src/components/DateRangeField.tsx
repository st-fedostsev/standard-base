import { Box, Typography } from '@mui/material';

import { DatePickerField } from '@/components/DatePickerField';

import { isInvalidRange, type DateRangeValue } from '@/utils/types/filters';

type DateRangeFieldProps = {
  value: DateRangeValue;
  onChange: (next: DateRangeValue) => void;
  fromLabel: string;
  toLabel: string;
};

/**
 * Период из двух полей. В календаре каждое поле ограничено вторым. Ввод с
 * клавиатуры может дать неверный порядок: это подсвечивается здесь и текстом в
 * FilterBar.
 */
export function DateRangeField({
  value,
  onChange,
  fromLabel,
  toLabel,
}: DateRangeFieldProps) {
  const invalid = isInvalidRange(value);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <DatePickerField
        label={fromLabel}
        value={value.from}
        max={value.to || undefined}
        error={invalid}
        onChange={(from) => onChange({ ...value, from })}
      />
      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
        —
      </Typography>
      <DatePickerField
        label={toLabel}
        value={value.to}
        min={value.from || undefined}
        error={invalid}
        onChange={(to) => onChange({ ...value, to })}
      />
    </Box>
  );
}
