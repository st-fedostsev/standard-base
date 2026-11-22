import { useMemo, useState } from 'react';

import { fromIsoDate, toIsoDate } from '@/utils/date';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import {
  Box,
  Button,
  ButtonBase,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

type DateRangeCalendarProps = {
  open: boolean;
  resetKey: number;
  initialDate: string;
  from: string;
  to: string;
  activeField: 'from' | 'to';
  onSelect: (date: string) => void;
};

type CalendarView = {
  resetKey: number;
  year: number;
  month: number;
};

type MenuAnchor = {
  resetKey: number;
  element: HTMLElement;
} | null;

const FIRST_RECORD_YEAR = 2025;

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const CELL_SIZE = 36;

const monthFormatter = new Intl.DateTimeFormat('ru-RU', {
  month: 'long',
});

const MONTHS = Array.from({ length: 12 }, (_, month) =>
  monthFormatter.format(new Date(2026, month, 1))
);

function getMonthDates(year: number, month: number): Array<Date | null> {
  const firstDay = new Date(year, month, 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return [
    ...Array.from({ length: mondayOffset }, () => null),
    ...Array.from(
      { length: daysInMonth },
      (_, index) => new Date(year, month, index + 1)
    ),
  ];
}

function formatDateLabel(value: string): string {
  const date = fromIsoDate(value);

  if (!date) return value;

  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function DateRangeCalendar({
  open,
  resetKey,
  initialDate,
  from,
  to,
  activeField,
  onSelect,
}: DateRangeCalendarProps) {
  const initialDateValue =
    fromIsoDate(initialDate) ??
    fromIsoDate(from) ??
    fromIsoDate(to) ??
    new Date();

  const currentYear = new Date().getFullYear();

  const clampYear = (value: number) =>
    Math.min(currentYear, Math.max(FIRST_RECORD_YEAR, value));

  const [view, setView] = useState<CalendarView | null>(null);

  // При смене resetKey календарь открывается на дате из актуальных пропсов.
  const calendarView: CalendarView =
    view?.resetKey === resetKey
      ? {
          ...view,
          year: clampYear(view.year),
        }
      : {
          resetKey,
          year: clampYear(initialDateValue.getFullYear()),
          month: initialDateValue.getMonth(),
        };

  const { year, month } = calendarView;

  const updateView = (next: Pick<CalendarView, 'year' | 'month'>) => {
    setView({ ...next, resetKey });
  };

  const [monthMenu, setMonthMenu] = useState<MenuAnchor>(null);
  const [yearMenu, setYearMenu] = useState<MenuAnchor>(null);

  const monthAnchor =
    monthMenu?.resetKey === resetKey ? monthMenu.element : null;
  const yearAnchor = yearMenu?.resetKey === resetKey ? yearMenu.element : null;

  const years = useMemo(
    () =>
      Array.from(
        { length: currentYear - FIRST_RECORD_YEAR + 1 },
        (_, index) => FIRST_RECORD_YEAR + index
      ),
    [currentYear]
  );

  const dates = getMonthDates(year, month);
  const today = toIsoDate(new Date());

  const selectDate = (date: Date) => {
    const value = toIsoDate(date);

    if (activeField === 'to' && from !== '' && value < from) {
      return;
    }

    onSelect(value);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          alignItems: 'center',
          gap: 1,
          px: 2,
          pt: 1.5,
          pb: 1,
        }}
      >
        <ButtonBase
          aria-haspopup='listbox'
          aria-expanded={Boolean(monthAnchor)}
          onClick={(event) =>
            setMonthMenu({ resetKey, element: event.currentTarget })
          }
          sx={{
            justifyContent: 'space-between',
            minWidth: 0,
            p: 0.5,
            borderRadius: 1,
            textAlign: 'left',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Typography
            variant='subtitle1'
            noWrap
            sx={{ fontWeight: 700, textTransform: 'capitalize' }}
          >
            {MONTHS[month]}
          </Typography>
          <KeyboardArrowDown fontSize='small' />
        </ButtonBase>

        <ButtonBase
          aria-haspopup='listbox'
          aria-expanded={Boolean(yearAnchor)}
          onClick={(event) =>
            setYearMenu({ resetKey, element: event.currentTarget })
          }
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.25,
            p: 0.5,
            borderRadius: 1,
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
            {year}
          </Typography>
          <KeyboardArrowDown fontSize='small' />
        </ButtonBase>

        <Menu
          anchorEl={monthAnchor}
          open={open && Boolean(monthAnchor)}
          onClose={() => setMonthMenu(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          slotProps={{
            paper: {
              sx: {
                maxHeight: 320,
                overflowY: 'auto',
              },
            },
          }}
        >
          {MONTHS.map((monthName, index) => (
            <MenuItem
              key={monthName}
              selected={month === index}
              onClick={() => {
                updateView({ year, month: index });
                setMonthMenu(null);
              }}
              sx={{ textTransform: 'capitalize' }}
            >
              {monthName}
            </MenuItem>
          ))}
        </Menu>

        <Menu
          anchorEl={yearAnchor}
          open={open && Boolean(yearAnchor)}
          onClose={() => setYearMenu(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            paper: {
              sx: {
                maxHeight: 320,
                overflowY: 'auto',
              },
            },
          }}
        >
          {years.map((itemYear) => (
            <MenuItem
              key={itemYear}
              selected={year === itemYear}
              disabled={itemYear < FIRST_RECORD_YEAR || itemYear > currentYear}
              onClick={() => {
                updateView({ year: itemYear, month });
                setYearMenu(null);
              }}
            >
              {itemYear}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      <Box sx={{ px: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
            justifyItems: 'center',
          }}
        >
          {WEEKDAYS.map((weekday) => (
            <Typography
              key={weekday}
              variant='caption'
              sx={{
                width: CELL_SIZE,
                height: 30,
                display: 'grid',
                placeItems: 'center',
                color: 'text.secondary',
              }}
            >
              {weekday}
            </Typography>
          ))}

          {dates.map((date, index) => {
            if (date === null) {
              return (
                <Box
                  key={`${year}-${month}-empty-${index}`}
                  sx={{ width: CELL_SIZE, height: CELL_SIZE }}
                />
              );
            }

            const dateValue = toIsoDate(date);
            const isSelected = dateValue === from || dateValue === to;
            const isInRange =
              from !== '' && to !== '' && dateValue > from && dateValue < to;
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const isToday = dateValue === today;
            const isDisabled =
              activeField === 'to' && from !== '' && dateValue < from;

            return (
              <Button
                key={dateValue}
                aria-label={formatDateLabel(dateValue)}
                aria-pressed={isSelected}
                disabled={isDisabled}
                onClick={() => selectDate(date)}
                sx={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  minWidth: 0,
                  p: 0,
                  borderRadius: '50%',
                  fontSize: 14,
                  color: isSelected
                    ? 'primary.contrastText'
                    : isWeekend
                      ? 'error.main'
                      : 'text.primary',
                  bgcolor: isSelected
                    ? 'primary.main'
                    : isInRange
                      ? (theme) => alpha(theme.palette.primary.main, 0.12)
                      : 'transparent',
                  boxShadow:
                    isToday && !isSelected ? 'inset 0 0 0 1px' : 'none',
                  '&:hover': {
                    bgcolor: isSelected ? 'primary.dark' : 'action.hover',
                  },
                  '&.Mui-disabled': {
                    color: 'text.disabled',
                    opacity: 0.4,
                  },
                }}
              >
                {date.getDate()}
              </Button>
            );
          })}
        </Box>
      </Box>

      <Box sx={{ p: 1.5 }}>
        <Button
          fullWidth
          variant='outlined'
          onClick={() => selectDate(new Date())}
        >
          ↑ Сегодня
        </Button>
      </Box>
    </Box>
  );
}
