import type { KeyboardEvent } from 'react';

import { IconButton, InputAdornment, TextField } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import SearchOutlined from '@mui/icons-material/SearchOutlined';

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** По умолчанию фиксированные 360px. true растягивает поле на весь контейнер */
  fullWidth?: boolean;
};

const DEFAULT_WIDTH = 360;

export function SearchInput({
  value,
  onChange,
  placeholder = 'Поиск',
  fullWidth = false,
}: SearchInputProps) {
  const clear = () => onChange('');

  // Escape очищает поле
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && value !== '') {
      e.preventDefault();
      clear();
    }
  };

  return (
    <TextField
      size='small'
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      sx={{ width: fullWidth ? '100%' : DEFAULT_WIDTH, maxWidth: '100%' }}
      slotProps={{
        htmlInput: { 'aria-label': placeholder },
        input: {
          startAdornment: (
            <InputAdornment position='start'>
              <SearchOutlined
                fontSize='small'
                sx={{ color: 'text.secondary' }}
              />
            </InputAdornment>
          ),
          endAdornment:
            value !== '' ? (
              <InputAdornment position='end'>
                <IconButton
                  size='small'
                  edge='end'
                  aria-label='Очистить поиск'
                  onClick={clear}
                >
                  <ClearIcon fontSize='small' />
                </IconButton>
              </InputAdornment>
            ) : undefined,
        },
      }}
    />
  );
}
