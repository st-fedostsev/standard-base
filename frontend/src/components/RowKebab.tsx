import { useState, type SyntheticEvent } from 'react';

import {
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';
import MoreHoriz from '@mui/icons-material/MoreHoriz';

import { useCurrentRole } from '@/utils/hooks/useCurrentRole';
import type { ActionItem } from '@/utils/types/actions';
import { hasAccess } from '@/utils/types/roles';

type RowKebabProps = {
  actions: ActionItem[];
  label?: string;
  alwaysVisible?: boolean;
};

/**
 * Кнопка «⋯» в строке таблицы. Видна при наведении на строку, при фокусе внутри
 * строки и пока открыто меню. Без наведения (телефон, планшет) видна всегда.
 * Селекторы ищут родителя .MuiTableRow-root, поэтому компонент рассчитан на MUI
 * TableRow.
 */
export function RowKebab({
  actions,
  label = 'Действия со строкой',
  alwaysVisible = false,
}: RowKebabProps) {
  const role = useCurrentRole();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const visible = actions.filter((action) => hasAccess(role, action.roles));
  if (visible.length === 0) return null;

  // Меню рисуется порталом, но React-события всплывают по дереву компонентов, поэтому останавливаем их здесь
  const stop = (e: SyntheticEvent) => e.stopPropagation();
  const close = () => setAnchor(null);

  return (
    <Box
      onClick={stop}
      onKeyDown={stop}
      sx={{
        display: 'inline-flex',
        // Пока меню открыто, кнопка остаётся видимой, даже если курсор ушёл на затемнение
        opacity: alwaysVisible || anchor ? 1 : 0,
        transition: 'opacity 120ms ease',
        '.MuiTableRow-root:hover &, .MuiTableRow-root:focus-within &': {
          opacity: 1,
        },
        '@media (hover: none)': { opacity: 1 },
      }}
    >
      <IconButton
        aria-label={label}
        aria-haspopup='menu'
        aria-expanded={Boolean(anchor)}
        onClick={(e) => setAnchor(e.currentTarget)}
      >
        <MoreHoriz fontSize='small' />
      </IconButton>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {visible.map((action) => {
          const Icon = action.icon;
          const color = action.danger ? 'error.main' : undefined;
          return (
            <MenuItem
              key={action.id}
              disabled={action.disabled}
              sx={{ color }}
              onClick={() => {
                close();
                action.onClick();
              }}
            >
              {Icon && (
                <ListItemIcon sx={{ color }}>
                  <Icon fontSize='small' />
                </ListItemIcon>
              )}
              <ListItemText primary={action.label} />
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
}
