import { ToggleButton, ToggleButtonGroup } from '@mui/material';

export type SwitcherOption<T extends string> = {
  value: T;
  label: string;
};

type SwitcherProps<T extends string> = {
  value: T;
  options: readonly SwitcherOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  disabled?: boolean;
};

/** Кнопок переключателей. */
export function Switcher<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  disabled = false,
}: SwitcherProps<T>) {
  return (
    <ToggleButtonGroup
      exclusive
      size='small'
      value={value}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(_, next: T | null) => {
        if (next !== null) onChange(next);
      }}
      sx={{
        flexWrap: 'nowrap',
        '& .MuiToggleButton-root': {
          px: '10px',
          py: '4px',
          fontSize: 13,
          fontWeight: 500,
          lineHeight: '22px',
          letterSpacing: '0.46px',
          color: 'primary.main',
          bgcolor: 'background.paper',
          borderColor: 'primary.main',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.06)' },
          '&.Mui-selected': {
            bgcolor: 'rgba(25, 118, 210, 0.12)',
            color: 'primary.main',
            '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.2)' },
          },
        },
      }}
    >
      {options.map((option) => (
        <ToggleButton key={option.value} value={option.value}>
          {option.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
