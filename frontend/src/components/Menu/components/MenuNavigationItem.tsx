import { NavLink, useLocation } from 'react-router-dom';

import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';

import { isExternalItem, type NavItem } from '@/utils/types/navigation';

import styles from '../Menu.module.css';
import { menuItemSx, railItemSx, revealSx } from './menuItemSx';

type MenuNavigationItemProps = {
  item: NavItem;
  rail: boolean;
  showLabels: boolean;
  onNavigate: () => void;
  notificationsOpen: boolean;
};

export function MenuNavigationItem({
  item,
  rail,
  showLabels,
  onNavigate,
  notificationsOpen,
}: MenuNavigationItemProps) {
  const { pathname } = useLocation();
  const Icon = item.icon;
  const itemSx = rail ? railItemSx : menuItemSx;

  const content = (
    <>
      <ListItemIcon>
        <Icon sx={{ fontSize: 24 }} />
      </ListItemIcon>

      <ListItemText primary={item.label} sx={revealSx(showLabels)} />
    </>
  );

  if (isExternalItem(item)) {
    return (
      <ListItemButton
        component='a'
        href={item.href}
        target='_blank'
        rel='noopener noreferrer'
        className={styles.item}
        aria-label={item.label}
        sx={itemSx}
        onClick={onNavigate}
      >
        {content}
      </ListItemButton>
    );
  }

  return (
    <ListItemButton
      component={NavLink}
      to={item.to}
      selected={!notificationsOpen && pathname === item.to}
      className={styles.item}
      aria-label={item.label}
      sx={itemSx}
      onClick={onNavigate}
    >
      {content}
    </ListItemButton>
  );
}
