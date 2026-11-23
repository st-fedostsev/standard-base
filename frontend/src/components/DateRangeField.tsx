import { useState } from 'react';

import { DateRangeCalendar } from '@/components/DateRangeCalendar';
import { formatRuDate, parseRuDate } from '@/utils/date';
import { isInvalidRange, type DateRangeValue } from '@/utils/types/filters';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import {
  Box,
  IconButton,
  InputAdornment,
  Popover,
  TextField,
  type Theme,
} from '@mui/material';
import type { SystemStyleObject } from '@mui/system';

import { fieldSx } from './fieldSx';

type DateRangeFieldProps = {
  value: DateRangeValue;
  defaultValue?: DateRangeValue;
  onChange: (next: DateRangeValue) => void;
  fromLabel: string;
  toLabel: string;
};

type ActiveField = 'from' | 'to';

function formatDateDraft(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 8);

  if (digits.length < 2) return digits;
  if (digits.length === 2) return `${digits}.`;

  if (digits.length < 4) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  }

  if (digits.length === 4) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.`;
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
}

function getCaretPosition(
  formatted: string,
  digitsBeforeCaret: number
): number {
  if (digitsBeforeCaret === 0) return 0;

  let digitCount = 0;

  for (let index = 0; index < formatted.length; index += 1) {
    if (/\d/.test(formatted[index])) {
      digitCount += 1;

      if (digitCount === digitsBeforeCaret) {
        let position = index + 1;

        if (formatted[position] === '.') {
          position += 1;
        }

        return position;
      }
    }
  }

  return formatted.length;
}

export function DateRangeField({
  value,
  defaultValue,
  onChange,
  fromLabel,
  toLabel,
}: DateRangeFieldProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [activeField, setActiveField] = useState<ActiveField>('from');
  const [resetKey, setResetKey] = useState(0);

  const [fromDraft, setFromDraft] = useState<string | null>(null);
  const [toDraft, setToDraft] = useState<string | null>(null);
  const [fromTouched, setFromTouched] = useState(false);
  const [toTouched, setToTouched] = useState(false);

  const rangeInvalid = isInvalidRange(value);

  const fromInvalidFormat =
    fromTouched &&
    fromDraft !== null &&
    fromDraft !== '' &&
    parseRuDate(fromDraft) === null;

  const toInvalidFormat =
    toTouched &&
    toDraft !== null &&
    toDraft !== '' &&
    parseRuDate(toDraft) === null;

  const openCalendar = (field: ActiveField, element: HTMLElement) => {
    setActiveField(field);
    setResetKey((current) => current + 1);
    setAnchor(element);
  };

  const closeCalendar = () => {
    // Не стираем введённый текст при закрытии календаря.
    setAnchor(null);
  };

  const handleDateChange =
    (field: ActiveField) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const input = event.target;
      const caret = input.selectionStart ?? input.value.length;
      const digitsBeforeCaret = input.value
        .slice(0, caret)
        .replace(/\D/g, '').length;
      const formatted = formatDateDraft(input.value);

      if (field === 'from') {
        setFromDraft(formatted);
        setFromTouched(false);

        const parsed = parseRuDate(formatted);

        if (parsed !== null) {
          onChange({
            from: parsed,
            to: value.to !== '' && value.to < parsed ? '' : value.to,
          });
        } else if (formatted === '') {
          onChange({ ...value, from: '' });
        }
      } else {
        setToDraft(formatted);
        setToTouched(false);

        const parsed = parseRuDate(formatted);

        if (parsed !== null) {
          onChange({ ...value, to: parsed });
        } else if (formatted === '') {
          onChange({ ...value, to: '' });
        }
      }

      const nextCaret = getCaretPosition(formatted, digitsBeforeCaret);

      requestAnimationFrame(() => {
        input.setSelectionRange(nextCaret, nextCaret);
      });
    };

  const handleBlur = (field: ActiveField) => {
    if (field === 'from') {
      const draft = fromDraft;

      if (draft === null) return;

      if (draft === '') {
        onChange({ ...value, from: '' });
        setFromDraft(null);
        setFromTouched(false);
        return;
      }

      if (parseRuDate(draft) !== null) {
        setFromDraft(null);
        setFromTouched(false);
        return;
      }

      // Невалидный ввод остаётся видимым, чтобы пользователь мог его исправить.
      setFromTouched(true);
      return;
    }

    const draft = toDraft;

    if (draft === null) return;

    if (draft === '') {
      onChange({ ...value, to: '' });
      setToDraft(null);
      setToTouched(false);
      return;
    }

    if (parseRuDate(draft) !== null) {
      setToDraft(null);
      setToTouched(false);
      return;
    }

    setToTouched(true);
  };

  const selectDate = (date: string) => {
    if (activeField === 'from') {
      onChange({
        from: date,
        to: value.to !== '' && value.to < date ? '' : value.to,
      });

      setFromDraft(null);
      setFromTouched(false);
      setActiveField('to');
      return;
    }

    if (value.from !== '' && date < value.from) return;

    onChange({ ...value, to: date });
    setToDraft(null);
    setToTouched(false);
    closeCalendar();
  };

  const fromActive = value.from !== (defaultValue?.from ?? '');
  const toActive = value.to !== (defaultValue?.to ?? '');

  const initialDate =
    activeField === 'to' ? value.to || value.from : value.from || value.to;

  const activeFieldSx = (active: boolean): SystemStyleObject<Theme> =>
    active
      ? {
          '& .MuiInputBase-input': {
            fontWeight: 600,
          },
          '& .MuiOutlinedInput-root:not(.Mui-error) .MuiOutlinedInput-notchedOutline':
            {
              borderColor: 'primary.main',
            },
          '& .MuiOutlinedInput-root:not(.Mui-error):hover .MuiOutlinedInput-notchedOutline':
            {
              borderColor: 'primary.main',
            },
        }
      : {};

  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 1,
          minWidth: 0,
          '@container filters (max-width: 300px)': {
            gridTemplateColumns: 'minmax(0, 1fr)',
          },
        }}
      >
        <TextField
          fullWidth
          size='small'
          label={fromLabel}
          placeholder='дд.мм.гггг'
          value={fromDraft ?? formatRuDate(value.from)}
          error={rangeInvalid || fromInvalidFormat}
          helperText={
            fromInvalidFormat
              ? 'Введите существующую дату в формате дд.мм.гггг'
              : undefined
          }
          onChange={handleDateChange('from')}
          onBlur={() => handleBlur('from')}
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: {
              inputMode: 'numeric',
              maxLength: 10,
              autoComplete: 'off',
              'aria-label': fromLabel,
            },
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    size='small'
                    aria-label={`Открыть календарь: ${fromLabel}`}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={(event) =>
                      openCalendar('from', event.currentTarget)
                    }
                  >
                    <CalendarMonthOutlined fontSize='small' />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{
            ...fieldSx,
            ...activeFieldSx(fromActive),
          }}
        />

        <TextField
          fullWidth
          size='small'
          label={toLabel}
          placeholder='дд.мм.гггг'
          value={toDraft ?? formatRuDate(value.to)}
          error={rangeInvalid || toInvalidFormat}
          helperText={
            toInvalidFormat
              ? 'Введите существующую дату в формате дд.мм.гггг'
              : undefined
          }
          onChange={handleDateChange('to')}
          onBlur={() => handleBlur('to')}
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: {
              inputMode: 'numeric',
              maxLength: 10,
              autoComplete: 'off',
              'aria-label': toLabel,
            },
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    size='small'
                    aria-label={`Открыть календарь: ${toLabel}`}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={(event) => openCalendar('to', event.currentTarget)}
                  >
                    <CalendarMonthOutlined fontSize='small' />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{
            ...fieldSx,
            ...activeFieldSx(toActive),
          }}
        />
      </Box>

      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={closeCalendar}
        disableScrollLock
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        marginThreshold={8}
        slotProps={{
          paper: {
            sx: {
              width: 320,
              maxWidth: 'calc(100vw - 16px)',
              mt: 0.5,
              overflow: 'hidden',
              borderRadius: 2,
            },
          },
        }}
      >
        <DateRangeCalendar
          key={resetKey}
          open={Boolean(anchor)}
          resetKey={resetKey}
          initialDate={initialDate}
          from={value.from}
          to={value.to}
          activeField={activeField}
          onSelect={selectDate}
        />
      </Popover>
    </>
  );
}
