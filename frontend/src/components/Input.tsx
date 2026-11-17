import { useId, useState } from 'react';

import { IconButton, InputAdornment, TextField } from '@mui/material';
import VisibilityOffOutlined from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';

import { ValidationContainer } from '@/components/containers/ValidationContainer';

type InputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  name?: string;
  type?: 'text' | 'email' | 'password';
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  errorText?: string;
};

export function Input({
  label,
  value,
  onChange,
  name,
  type = 'text',
  autoComplete,
  required = false,
  disabled = false,
  errorText,
}: InputProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <ValidationContainer errorText={errorText} errorId={errorId}>
      <TextField
        id={id}
        fullWidth
        size='small'
        label={label}
        name={name}
        type={inputType}
        value={value}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        error={Boolean(errorText)}
        onChange={(event) => onChange(event.target.value)}
        slotProps={{
          htmlInput: {
            'aria-describedby': errorText ? errorId : undefined,
          },
          input: {
            endAdornment: isPassword ? (
              <InputAdornment position='end'>
                <IconButton
                  aria-label={
                    showPassword ? 'Скрыть пароль' : 'Показать пароль'
                  }
                  edge='end'
                  disabled={disabled}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setShowPassword((previous) => !previous)}
                >
                  {showPassword ? (
                    <VisibilityOffOutlined />
                  ) : (
                    <VisibilityOutlined />
                  )}
                </IconButton>
              </InputAdornment>
            ) : undefined,
          },
        }}
      />
    </ValidationContainer>
  );
}
