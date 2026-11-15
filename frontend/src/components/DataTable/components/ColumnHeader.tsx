import { useState } from 'react';

import {
  ButtonBase,
  Divider,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import RestartAlt from '@mui/icons-material/RestartAlt';

import {
  menuDividerSx,
  menuItemSx,
} from '@/components/Menu/components/menuItemSx';

import type { SortDir, SortLabels } from '../types';

type ColumnHeaderProps = {
  title: string;
  sortLabels?: SortLabels;
  current: SortDir | null;
  onSort: (direction: SortDir | null) => void;
};

export function ColumnHeader({
  title,
  sortLabels,
  current,
  onSort,
}: ColumnHeaderProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const open = Boolean(anchor);

  const close = () => setAnchor(null);

  const pick = (direction: SortDir | null) => {
    close();
    onSort(direction);
  };

  if (!sortLabels) {
    return (
      <Typography
        variant='body2'
        sx={{
          fontWeight: 600,
          color: 'text.secondary',
          overflowWrap: 'anywhere',
        }}
      >
        {title}
      </Typography>
    );
  }

  return (
    <>
      <ButtonBase
        aria-haspopup='menu'
        aria-expanded={open}
        aria-label={`Сортировка: ${title}`}
        onClick={(event) => setAnchor(event.currentTarget)}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          px: 0.5,
          mx: -0.5,
          py: 0.5,
          maxWidth: '100%',
          textAlign: 'left',
          borderRadius: 1,
          color: current || open ? 'text.primary' : 'text.secondary',

          '&:hover': {
            bgcolor: 'grey.100',
            color: 'text.primary',
          },

          '&.Mui-focusVisible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: 1,
          },
        }}
      >
        <Typography
          component='span'
          variant='body2'
          sx={{
            fontWeight: 600,
            minWidth: 0,
            overflowWrap: 'anywhere',
          }}
        >
          {title}
        </Typography>

        <KeyboardArrowDown
          fontSize='small'
          sx={{
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'none',
            opacity: current || open ? 1 : 0.5,
            transition: 'transform 150ms ease',
          }}
        />
      </ButtonBase>

      <Menu
        anchorEl={anchor}
        open={open}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 220,
              maxWidth: 'calc(100vw - 32px)',
              borderRadius: 2,
              mt: 0.5,
            },
          },
          list: {
            sx: { px: 1, py: 1 },
          },
        }}
      >
        <ListSubheader
          disableSticky
          sx={{
            lineHeight: '32px',
            fontSize: 12,
            fontWeight: 600,
            color: 'text.secondary',
            px: 2,
          }}
        >
          Сортировка
        </ListSubheader>

        <MenuItem
          selected={current === 'asc'}
          sx={menuItemSx}
          onClick={() => pick('asc')}
        >
          <ListItemIcon>
            <ArrowUpward fontSize='small' />
          </ListItemIcon>
          <ListItemText primary={sortLabels.asc} />
        </MenuItem>

        <MenuItem
          selected={current === 'desc'}
          sx={menuItemSx}
          onClick={() => pick('desc')}
        >
          <ListItemIcon>
            <ArrowDownward fontSize='small' />
          </ListItemIcon>
          <ListItemText primary={sortLabels.desc} />
        </MenuItem>

        <Divider sx={menuDividerSx} />

        <MenuItem
          disabled={current === null}
          sx={menuItemSx}
          onClick={() => pick(null)}
        >
          <ListItemIcon>
            <RestartAlt fontSize='small' />
          </ListItemIcon>
          <ListItemText primary='Сбросить' />
        </MenuItem>
      </Menu>
    </>
  );
}
