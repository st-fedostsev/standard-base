import { useId, useState } from 'react';

import { ValidationContainer } from '@/components/containers/ValidationContainer';
import VisibilityOffOutlined from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import { IconButton, InputAdornment, TextField } from '@mui/material';

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
  helperText?: string;
  placeholder?: string;
  multiline?: boolean;
  minRows?: number;
  maxRows?: number;
  /** Мягкий лимит символов. Ввод и вставка обрезаются, под полем виден счётчик. */
  maxLength?: number;
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
  helperText,
  placeholder,
  multiline = false,
  minRows,
  maxRows,
  maxLength,
  autoFocus = false,
}: InputProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;
  const isAtLimit = maxLength !== undefined && value.length >= maxLength;
  const showCounter =
    maxLength !== undefined && (isFocused || value.length > 0);
  const counter = showCounter ? `${value.length}/${maxLength}` : undefined;
  const describedBy = errorText ? errorId : helperText ? helperId : undefined;

  return (
    <ValidationContainer
      errorText={errorText}
      errorId={errorId}
      helperText={helperText}
      helperId={helperId}
      counter={counter}
      counterColor={isAtLimit ? 'warning.main' : 'text.secondary'}
    >
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
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        slotProps={{
          htmlInput: {
            'aria-describedby': describedBy,
            'aria-label': ariaLabel,
            maxLength,
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
