import type { SxProps, Theme } from '@mui/material';

/** Горизонтальные отступы пункта в полном меню и в режиме иконок. */
export const MENU_ITEM_PX = 2;
export const RAIL_ITEM_PX = 1.5;

const itemBase = {
  // Чуть больше пространства между пунктами.
  minHeight: 44,
  borderRadius: 1,
  color: '#242424',

  // Общая колонка для иконок, включая аватарку.
  '& .MuiListItemIcon-root': {
    minWidth: 36,
    flexShrink: 0,
    color: 'inherit',
  },

  '& .MuiListItemText-primary': {
    fontSize: 14,
    lineHeight: 1.4,
  },

  '& .MuiListItemText-secondary': {
    fontSize: 12,
    lineHeight: 1.3,
  },

  // Наведение и выбранный пункт отличаются друг от друга.
  '@media (hover: hover)': {
    '&:hover': {
      bgcolor: 'rgba(0, 0, 0, 0.05)',
    },
  },

  '&.Mui-selected, &.Mui-selected:hover': {
    bgcolor: 'var(--primary-_states-selected, #1976D214)',
    color: '#242424',

    '& .MuiListItemText-primary': {
      fontWeight: 600,
    },
  },

  // Фокус должен быть заметен при управлении с клавиатуры.
  '&.Mui-focusVisible': {
    outline: '2px solid',
    outlineColor: 'primary.main',
    outlineOffset: -2,
  },

  transition: 'background-color 120ms ease, color 120ms ease',

  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },
} as const;

/** Полное меню, строка пользователя и пункты попапов. */
export const menuItemSx = {
  ...itemBase,
  px: MENU_ITEM_PX,
} as const;

/** Промежуточное меню только с иконками. */
export const railItemSx = {
  ...itemBase,
  px: RAIL_ITEM_PX,
} as const;

/** Плавное появление подписей при раскрытии меню. */
export const revealSx = (visible: boolean) =>
  ({
    minWidth: 0,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    opacity: visible ? 1 : 0,
    transition: visible ? 'opacity 200ms ease 80ms' : 'opacity 100ms ease',
  }) as const;

export const menuDividerSx: SxProps<Theme> = {
  height: '1px',
  border: 'none',
  background: 'rgba(0, 0, 0, 0.08)',
  margin: '4px 8px',
};
