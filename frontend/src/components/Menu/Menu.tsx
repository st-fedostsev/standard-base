import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';

import { Sticky } from '@/components/Sticky';
import type { NavItem } from '@/utils/types/navigation';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, Drawer, IconButton, useMediaQuery } from '@mui/material';

import {
  FULL_WIDTH,
  RAIL_WIDTH,
  SidebarContent,
} from './components/SidebarContent';

import styles from './Menu.module.css';

type MenuProps = {
  items: NavItem[];
  footerItems?: NavItem[];
  title?: string;
  children: ReactNode;
};

const SIDEBAR_SHADOW = '4px 0 10px 0 rgba(25, 118, 210, 0.2)';

export function Menu({ items, footerItems = [], title, children }: MenuProps) {
  // До 992px — мобильное меню.
  const isMobile = useMediaQuery('(max-width: 991.95px)', {
    noSsr: true,
  });

  // От 992px до 1200px — меню с иконками.
  const isRail = useMediaQuery(
    '(min-width: 992px) and (max-width: 1199.95px)',
    { noSsr: true }
  );

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigator = useNavigate();

  // В режиме иконок меню остаётся раскрытым, пока открыты уведомления.
  const expanded = !isRail || hovered || focused || notificationsOpen;

  const closeMobileDrawer = () => {
    setDrawerOpen(false);
    setNotificationsOpen(false);
  };

  const onRegister = () => {
    navigator('/login');
  };

  const sidebarContent = (
    <SidebarContent
      items={items}
      footerItems={footerItems}
      title={title}
      rail={isMobile ? false : isRail}
      showLabels={isMobile ? true : expanded}
      isMobile={isMobile}
      notificationsOpen={notificationsOpen}
      onOpenNotifications={() => setNotificationsOpen(true)}
      onCloseNotifications={() => setNotificationsOpen(false)}
      onNavigate={closeMobileDrawer}
      onRegister={onRegister}
    />
  );

  return (
    <Box className={styles.layout}>
      {isMobile ? (
        <>
          {/* Подложка мобильной шапки. */}
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
          {/* В режиме иконок раскрытая панель находится поверх страницы. */}
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
                bgcolor: '#fff',
                boxShadow: SIDEBAR_SHADOW,
              }}
            >
              {sidebarContent}
            </Box>
          </Box>
        </Sticky>
      )}

      <Box
        component='main'
        className={styles.main}
        sx={{
          flex: '1 1 0',
          minWidth: 0,
          boxSizing: 'border-box',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
