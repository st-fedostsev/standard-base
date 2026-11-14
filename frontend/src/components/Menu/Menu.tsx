import { useState, type ReactNode } from 'react';

import { Box, Drawer, IconButton, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

import { Sticky } from '@/components/Sticky';

import type { NavItem } from '@/utils/types/navigation';
import type { NotificationItem } from '@/utils/types/notifications';

import styles from './Menu.module.css';
import {
  FULL_WIDTH,
  RAIL_WIDTH,
  SidebarContent,
} from './components/SidebarContent';

type MenuProps = {
  items: NavItem[];
  footerItems?: NavItem[];
  title?: string;
  children: ReactNode;

  notifications: readonly NotificationItem[];
  unreadNotificationsCount: number;
  onMarkNotificationRead: (id: string) => void;
  onHideNotification: (id: string) => void;
};

export function Menu({
  items,
  footerItems = [],
  title,
  children,
  notifications,
  unreadNotificationsCount,
  onMarkNotificationRead,
  onHideNotification,
}: MenuProps) {
  // В примере Контура граница мобильного меню — около 992px.
  const isMobile = useMediaQuery('(max-width: 991.95px)', {
    noSsr: true,
  });

  // Сохраняем ранее согласованный режим иконок на средней ширине.
  const isRail = useMediaQuery(
    '(min-width: 992px) and (max-width: 1199.95px)',
    { noSsr: true }
  );

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const expanded = !isRail || hovered || focused || notificationsOpen;

  const closeMobileDrawer = () => {
    setDrawerOpen(false);
    setNotificationsOpen(false);
  };

  const sidebarContent = (
    <SidebarContent
      items={items}
      footerItems={footerItems}
      title={title}
      rail={isMobile ? false : isRail}
      showLabels={isMobile ? true : expanded}
      isMobile={isMobile}
      notifications={notifications}
      unreadNotificationsCount={unreadNotificationsCount}
      notificationsOpen={notificationsOpen}
      onOpenNotifications={() => setNotificationsOpen(true)}
      onCloseNotifications={() => setNotificationsOpen(false)}
      onMarkNotificationRead={onMarkNotificationRead}
      onHideNotification={onHideNotification}
      onNavigate={closeMobileDrawer}
    />
  );

  return (
    <Box className={styles.layout}>
      {isMobile ? (
        <>
          {/* Белая подложка мобильной шапки, как smallMenuBackground. */}
          <Box className={styles.smallMenuBackground}>
            <IconButton
              aria-label='Открыть меню'
              onClick={() => setDrawerOpen(true)}
              sx={{ m: 1 }}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          <Drawer
            open={drawerOpen}
            onClose={closeMobileDrawer}
            slotProps={{
              paper: {
                sx: {
                  width: FULL_WIDTH,
                  maxWidth: '100vw',
                  height: '100dvh',
                  boxSizing: 'border-box',
                  bgcolor: 'grey.100',
                },
              },
            }}
          >
            {sidebarContent}
          </Drawer>
        </>
      ) : (
        <Sticky side='top' className={styles.sticky}>
          {/*
            Ширина Sticky резервирует место под меню.
            В режиме иконок раскрытая панель показывается поверх страницы.
          */}
          <Box
            sx={{
              position: 'relative',
              width: isRail ? RAIL_WIDTH : FULL_WIDTH,
            }}
          >
            <Box
              component='nav'
              aria-label='Основное меню'
              className={styles.menu}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              onFocus={(event) => {
                if (event.target.matches(':focus-visible')) {
                  setFocused(true);
                }
              }}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setFocused(false);
                }
              }}
              sx={{
                width: expanded ? FULL_WIDTH : RAIL_WIDTH,
              }}
            >
              {sidebarContent}
            </Box>
          </Box>
        </Sticky>
      )}

      <Box
        component='main'
        sx={{
          flex: '1 1 0',
          minWidth: 0,
          boxSizing: 'border-box',
        }}
        className={styles.main}
      >
        {children}
      </Box>
    </Box>
  );
}
