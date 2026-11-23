import { FormControlLabel, Switch } from '@mui/material';

type SwitchFieldProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

export function SwitchField({
  label,
  checked,
  onChange,
  disabled = false,
}: SwitchFieldProps) {
  return (
    <FormControlLabel
      label={label}
      labelPlacement='start'
      disabled={disabled}
      control={
        <Switch
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
      }
      sx={{ ml: 0, mr: 0 }}
    />
  );
}
