import { useId, useState } from 'react';

import { IconButton, InputAdornment, TextField } from '@mui/material';
import VisibilityOffOutlined from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';

import { ValidationContainer } from '@/components/containers/ValidationContainer';

export type InputProps = {
  /** Подпись поля. Не задана: поле без видимой подписи, нужен ariaLabel. */
  label?: string;
  /** Доступное имя для поля без видимой подписи. */
  ariaLabel?: string;
  value: string;
  onChange: (value: string) => void;
  name?: string;
  type?: 'text' | 'email' | 'password';
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  errorText?: string;
  placeholder?: string;
  multiline?: boolean;
  minRows?: number;
  maxRows?: number;
  autoFocus?: boolean;
};

export function Input({
  label,
  ariaLabel,
  value,
  onChange,
  name,
  type = 'text',
  autoComplete,
  required = false,
  disabled = false,
  errorText,
  placeholder,
  multiline = false,
  minRows,
  maxRows,
  autoFocus = false,
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
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        error={Boolean(errorText)}
        multiline={multiline}
        minRows={multiline ? minRows : undefined}
        maxRows={multiline ? maxRows : undefined}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
        slotProps={{
          htmlInput: {
            'aria-describedby': errorText ? errorId : undefined,
            'aria-label': ariaLabel,
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
