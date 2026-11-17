import { useId, useMemo, useState } from 'react';

import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  InputAdornment,
  Popover,
  TextField,
  Typography,
} from '@mui/material';
import CancelOutlined from '@mui/icons-material/CancelOutlined';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import SearchOutlined from '@mui/icons-material/SearchOutlined';

import type { FilterOption } from '@/utils/types/filters';

type MultiSelectFieldProps = {
  label: string;
  options: readonly FilterOption[];

  /** Пустой массив означает отсутствие фильтра. */
  value: string[];
  onChange: (next: string[]) => void;

  width?: number | string;

  /** Показывать поиск внутри списка. */
  searchable?: boolean;

  /** Отличается ли значение от начального. */
  active?: boolean;
};

export function MultiSelectField({
  label,
  options,
  value,
  onChange,
  width = '100%',
  searchable = false,
  active = value.length > 0,
}: MultiSelectFieldProps) {
  const popoverId = useId();

  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [search, setSearch] = useState('');

  const open = Boolean(anchor);

  const visibleOptions = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('ru');

    if (!query) {
      return options;
    }

    return options.filter((option) =>
      option.label.toLocaleLowerCase('ru').includes(query)
    );
  }, [options, search]);

  const close = () => {
    setAnchor(null);
    setSearch('');
  };

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((item) => item !== optionValue));
      return;
    }

    onChange([...value, optionValue]);
  };

  return (
    <Box sx={{ width, maxWidth: '100%', minWidth: 0 }}>
      <Button
        fullWidth
        variant='outlined'
        aria-label={
          value.length > 0 ? `${label}: выбрано ${value.length}` : label
        }
        aria-haspopup='dialog'
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        onClick={(event) => setAnchor(event.currentTarget)}
        endIcon={<KeyboardArrowDown />}
        sx={{
          minWidth: 0,
          justifyContent: 'space-between',
          textAlign: 'left',
          textTransform: 'none',

          /*
           * Цвет и рамка зависят от состояния фильтра.
           * Здесь задана обводка именно этого компонента.
           */
          color: active ? 'text.primary' : 'text.secondary',
          fontWeight: active ? 600 : 400,
          borderColor: active ? 'primary.main' : 'divider',

          '&:hover': {
            borderColor: active ? 'primary.main' : 'text.secondary',
            bgcolor: 'action.hover',
          },

          '&.Mui-focusVisible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: 2,
          },

          '& .MuiButton-endIcon': {
            flexShrink: 0,
          },
        }}
      >
        <Box
          component='span'
          sx={{
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </Box>
      </Button>

      <Popover
        id={popoverId}
        open={open}
        anchorEl={anchor}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            role: 'dialog',
            'aria-label': `Фильтр: ${label}`,
            sx: {
              width: 280,
              maxWidth: 'calc(100vw - 32px)',
              maxHeight: 'min(360px, calc(100dvh - 32px))',
              mt: 0.5,
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        {searchable && (
          <Box sx={{ p: 1 }}>
            <TextField
              autoFocus
              fullWidth
              size='small'
              placeholder={`Поиск: ${label.toLowerCase()}`}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              slotProps={{
                htmlInput: {
                  'aria-label': `Поиск: ${label.toLowerCase()}`,
                },
                input: {
                  startAdornment: (
                    <InputAdornment position='start'>
                      <SearchOutlined
                        fontSize='small'
                        sx={{ color: 'text.secondary' }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
        )}

        {value.length > 0 && (
          <>
            {searchable && <Divider />}

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                bgcolor: 'action.hover',
              }}
            >
              <Typography variant='body2' sx={{ fontWeight: 600 }}>
                Выбрано: {value.length}
              </Typography>

              <Button
                size='small'
                color='inherit'
                startIcon={<CancelOutlined fontSize='small' />}
                onClick={() => onChange([])}
                sx={{ textTransform: 'none' }}
              >
                Сбросить
              </Button>
            </Box>
          </>
        )}

        {(searchable || value.length > 0) && <Divider />}

        <Box
          role='group'
          aria-label={`Варианты: ${label}`}
          sx={{
            overflowY: 'auto',
            minHeight: 0,
            p: 1,
          }}
        >
          {visibleOptions.length === 0 ? (
            <Typography variant='body2' sx={{ color: 'text.secondary', p: 1 }}>
              Ничего не найдено
            </Typography>
          ) : (
            visibleOptions.map((option) => (
              <FormControlLabel
                key={option.value}
                control={
                  <Checkbox
                    size='small'
                    checked={value.includes(option.value)}
                    onChange={() => toggleOption(option.value)}
                  />
                }
                label={option.label}
                sx={{
                  display: 'flex',
                  width: '100%',
                  m: 0,
                  minWidth: 0,

                  '& .MuiFormControlLabel-label': {
                    minWidth: 0,
                    overflowWrap: 'anywhere',
                  },
                }}
              />
            ))
          )}
        </Box>
      </Popover>
    </Box>
  );
}
