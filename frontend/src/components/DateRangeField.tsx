import { Box } from '@mui/material';

import { DatePickerField } from '@/components/DatePickerField';
import fieldStyles from '@/components/FilterField.module.css';

import { isInvalidRange, type DateRangeValue } from '@/utils/types/filters';

type DateRangeFieldProps = {
  value: DateRangeValue;

  /** Начальное значение для определения изменённых полей. */
  defaultValue?: DateRangeValue;

  onChange: (next: DateRangeValue) => void;
  fromLabel: string;
  toLabel: string;
};

export function DateRangeField({
  value,
  defaultValue,
  onChange,
  fromLabel,
  toLabel,
}: DateRangeFieldProps) {
  const invalid = isInvalidRange(value);

  const fromChanged = value.from !== (defaultValue?.from ?? '');
  const toChanged = value.to !== (defaultValue?.to ?? '');

  return (
    <Box
      sx={{
        width: '100%',
        minWidth: 0,
        containerType: 'inline-size',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 1,
          minWidth: 0,

          '@container (max-width: 300px)': {
            gridTemplateColumns: 'minmax(0, 1fr)',
          },
        }}
      >
        <Box className={fromChanged ? fieldStyles.active : undefined}>
          <DatePickerField
            label={fromLabel}
            value={value.from}
            max={value.to || undefined}
            error={invalid}
            width='100%'
            onChange={(from) => onChange({ ...value, from })}
          />
        </Box>

        <Box className={toChanged ? fieldStyles.active : undefined}>
          <DatePickerField
            label={toLabel}
            value={value.to}
            min={value.from || undefined}
            error={invalid}
            width='100%'
            onChange={(to) => onChange({ ...value, to })}
          />
        </Box>
      </Box>
    </Box>
  );
}
