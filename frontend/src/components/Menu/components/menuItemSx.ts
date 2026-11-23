import type { SxProps, Theme } from '@mui/material';

/** Отступы пунктов в полном меню и в режиме иконок. */
export const MENU_ITEM_PX = 1.5; // 12px
export const RAIL_ITEM_PX = 1.5;

const itemBase = {
  minHeight: 44,
  width: 'calc(100% - 16px)',
  mx: 1, // по 8px от края меню слева и справа
  borderRadius: '4px',
  color: '#242424',

  '& .MuiListItemIcon-root': {
    minWidth: 36,
    flexShrink: 0,
    color: 'inherit',

    '& svg': {
      fontSize: 24,
    },
  },

  '& .MuiListItemText-primary': {
    fontSize: 16,
    fontWeight: 600,
    lineHeight: 1.5,
    letterSpacing: '0.15px',
  },

  '@media (hover: hover)': {
    '&:hover': {
      bgcolor: 'rgba(0, 0, 0, 0.04)',
    },
  },

  '&.Mui-selected, &.Mui-selected:hover': {
    bgcolor: 'rgba(25, 118, 210, 0.08)',
    color: 'rgba(0, 0, 0, 0.87)',

    '& .MuiListItemText-primary': {
      fontWeight: 700,
    },
  },

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

/** Полное меню. */
export const menuItemSx = {
  ...itemBase,
  px: MENU_ITEM_PX,
} as const;

/** Меню в режиме иконок. */
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

    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  }) as const;

export const menuDividerSx: SxProps<Theme> = {
  height: '1px',
  border: 'none',
  background: 'rgba(0, 0, 0, 0.08)',
  margin: '4px 8px',
};
