import { useState, type MouseEvent } from 'react';

import {
  Box,
  Button,
  ButtonBase,
  IconButton,
  InputAdornment,
  Popover,
  TextField,
  Typography,
} from '@mui/material';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';

import {
  addMonths,
  buildMonthGrid,
  formatRu,
  fromIsoDate,
  parseRu,
  startOfMonth,
  toIsoDate,
  todayIso,
} from '@/utils/date';

type DatePickerFieldProps = {
  label: string;
  /** YYYY-MM-DD, пусто: не задано */
  value: string;
  onChange: (value: string) => void;
  /** Самая ранняя доступная дата в календаре, YYYY-MM-DD */
  min?: string;
  /** Самая поздняя доступная дата в календаре, YYYY-MM-DD */
  max?: string;
  error?: boolean;
  width?: number;
  dataTid?: string;
};

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const CELL_PX = 36;
const CALENDAR_WIDTH = CELL_PX * 7 + 32;

/**
 * Поле даты: можно ввести дд.мм.гггг с клавиатуры или выбрать в календаре.
 * Значение наружу всегда в формате YYYY-MM-DD.
 */
export function DatePickerField({
  label,
  value,
  onChange,
  min,
  max,
  error = false,
  width = 170,
  dataTid,
}: DatePickerFieldProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  // Текст, который печатает пользователь. null: показываем значение из пропса
  const [draft, setDraft] = useState<string | null>(null);
  // Месяц, который открыт в календаре
  const [view, setView] = useState(() => startOfMonth(new Date()));

  const isOutOfRange = (iso: string) =>
    (min !== undefined && iso < min) || (max !== undefined && iso > max);

  const openCalendar = (e: MouseEvent<HTMLButtonElement>) => {
    setView(startOfMonth(fromIsoDate(value) ?? new Date()));
    setAnchor(e.currentTarget);
  };

  const closeCalendar = () => setAnchor(null);

  const pick = (iso: string) => {
    onChange(iso);
    setDraft(null);
    closeCalendar();
  };

  const handleText = (text: string) => {
    setDraft(text);
    if (text.trim() === '') {
      onChange('');
      return;
    }
    // Пока дата неполная, наружу ничего не отдаём
    const iso = parseRu(text);
    if (iso !== null) onChange(iso);
  };

  const today = todayIso();
  const days = buildMonthGrid(view);
  const monthTitle = new Intl.DateTimeFormat('ru-RU', {
    month: 'long',
    year: 'numeric',
  }).format(view);

  return (
    <Box data-tid={dataTid} sx={{ width }}>
      <TextField
        label={label}
        size='small'
        fullWidth
        error={error}
        value={draft ?? formatRu(value)}
        placeholder='дд.мм.гггг'
        onChange={(e) => handleText(e.target.value)}
        onBlur={() => setDraft(null)}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton
                  size='small'
                  edge='end'
                  aria-label={`Открыть календарь: ${label}`}
                  onClick={openCalendar}
                >
                  <CalendarMonthOutlined fontSize='small' />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={closeCalendar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: { p: 2, mt: 0.5, borderRadius: 2, width: CALENDAR_WIDTH },
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1,
          }}
        >
          <IconButton
            size='small'
            aria-label='Предыдущий месяц'
            onClick={() => setView((v) => addMonths(v, -1))}
          >
            <ChevronLeft fontSize='small' />
          </IconButton>
          <Typography
            variant='subtitle2'
            sx={{ fontWeight: 600, textTransform: 'capitalize' }}
          >
            {monthTitle}
          </Typography>
          <IconButton
            size='small'
            aria-label='Следующий месяц'
            onClick={() => setView((v) => addMonths(v, 1))}
          >
            <ChevronRight fontSize='small' />
          </IconButton>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(7, ${CELL_PX}px)`,
            justifyContent: 'center',
            rowGap: 0.5,
          }}
        >
          {WEEKDAYS.map((w) => (
            <Typography
              key={w}
              variant='caption'
              sx={{
                textAlign: 'center',
                color: 'text.secondary',
                lineHeight: `${CELL_PX}px`,
              }}
            >
              {w}
            </Typography>
          ))}

          {days.map((day) => {
            const iso = toIsoDate(day);
            const isSelected = iso === value;
            const isToday = iso === today;
            const inMonth = day.getMonth() === view.getMonth();
            return (
              <ButtonBase
                key={iso}
                aria-label={formatRu(iso)}
                aria-pressed={isSelected}
                disabled={isOutOfRange(iso)}
                onClick={() => pick(iso)}
                sx={{
                  width: CELL_PX,
                  height: CELL_PX,
                  borderRadius: '50%',
                  fontSize: 14,
                  color: isSelected
                    ? 'primary.contrastText'
                    : inMonth
                      ? 'text.primary'
                      : 'text.disabled',
                  bgcolor: isSelected ? 'primary.main' : 'transparent',
                  border: '1px solid',
                  borderColor:
                    isToday && !isSelected ? 'primary.main' : 'transparent',
                  '&:hover': {
                    bgcolor: isSelected ? 'primary.dark' : 'grey.100',
                  },
                  '&.Mui-disabled': { color: 'text.disabled', opacity: 0.4 },
                  '&.Mui-focusVisible': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: 1,
                  },
                }}
              >
                {day.getDate()}
              </ButtonBase>
            );
          })}
        </Box>

        <Box sx={{ mt: 1 }}>
          <Button
            size='small'
            disabled={isOutOfRange(today)}
            onClick={() => pick(today)}
          >
            Сегодня
          </Button>
        </Box>
      </Popover>
    </Box>
  );
}
