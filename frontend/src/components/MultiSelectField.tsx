import { useId } from 'react';

import {
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
} from '@mui/material';

import type { FilterOption } from '@/utils/types/filters';

type MultiSelectFieldProps = {
  label: string;
  options: readonly FilterOption[];
  /** Пустой массив: «все» */
  value: string[];
  onChange: (next: string[]) => void;
  width?: number;
};

export function MultiSelectField({
  label,
  options,
  value,
  onChange,
  width = 220,
}: MultiSelectFieldProps) {
  const labelId = useId();

  // В закрытом поле показываем подписи выбранных через запятую
  const renderValue = (selected: string[]) =>
    options
      .filter((o) => selected.includes(o.value))
      .map((o) => o.label)
      .join(', ');

  return (
    <FormControl size='small' sx={{ width }}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        multiple
        value={value}
        label={label}
        renderValue={renderValue}
        onChange={(e) => {
          const next = e.target.value;
          onChange(typeof next === 'string' ? next.split(',') : next);
        }}
      >
        {options.map((o) => (
          <MenuItem key={o.value} value={o.value}>
            <Checkbox size='small' checked={value.includes(o.value)} />
            <ListItemText primary={o.label} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
