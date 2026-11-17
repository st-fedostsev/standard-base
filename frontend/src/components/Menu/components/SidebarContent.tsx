import { Box, Divider, List } from '@mui/material';

import { useCurrentRole } from '@/utils/hooks/useCurrentRole';
import type { NavItem } from '@/utils/types/navigation';
import type { NotificationItem } from '@/utils/types/notifications';
import { hasAccess } from '@/utils/types/roles';

import styles from '../Menu.module.css';
import { MainMenuHeader } from './MainMenuHeader';
import { MenuNavigationItem } from './MenuNavigationItem';
import { NotificationMenuItem } from './NotificationMenuItem';
import { UserMenu } from './UserMenu';

export const RAIL_WIDTH = 64;
export const FULL_WIDTH = 220;

type SidebarContentProps = {
  items: NavItem[];
  footerItems: NavItem[];
  title?: string;

  rail: boolean;
  showLabels: boolean;
  isMobile: boolean;

  notifications: readonly NotificationItem[];
  unreadNotificationsCount: number;
  notificationsOpen: boolean;
  onOpenNotifications: () => void;
  onCloseNotifications: () => void;
  onMarkNotificationRead: (id: string) => void;
  onHideNotification: (id: string) => void;

  onNavigate: () => void;
};

export function SidebarContent({
  items,
  footerItems,
  title,
  rail,
  showLabels,
  isMobile,
  notifications,
  unreadNotificationsCount,
  notificationsOpen,
  onOpenNotifications,
  onCloseNotifications,
  onMarkNotificationRead,
  onHideNotification,
  onNavigate,
}: SidebarContentProps) {
  const role = useCurrentRole();

  const visibleItems = items.filter((item) => hasAccess(role, item.roles));
  const visibleFooterItems = footerItems.filter((item) =>
    hasAccess(role, item.roles)
  );

  return (
    <Box className={styles.content}>
      <MainMenuHeader title={title} showLabels={showLabels} />

      <Divider className={styles.menuDivider} />

      {/* Аналог SideMenu.Body */}
      <List component='div' disablePadding className={styles.body}>
        <NotificationMenuItem
          notifications={notifications}
          unreadCount={unreadNotificationsCount}
          open={notificationsOpen}
          onOpen={onOpenNotifications}
          onClose={onCloseNotifications}
          onMarkRead={onMarkNotificationRead}
          onHide={onHideNotification}
          rail={rail}
          expanded={showLabels}
          isMobile={isMobile}
          sidebarWidth={FULL_WIDTH}
        />

        {visibleItems.map((item) => (
          <MenuNavigationItem
            key={item.id}
            item={item}
            rail={rail}
            showLabels={showLabels}
            onNavigate={onNavigate}
          />
        ))}
      </List>

      {/* Аналог SideMenu.Footer */}
      {/* Нижние пункты и пользователь */}
      <Box
        sx={{
          mt: 'auto',
          flexShrink: 0,
          px: 1,
          pt: 1,
          pb: 2,
        }}
      >
        <List component='div' disablePadding>
          {visibleFooterItems.map((item) => (
            <MenuNavigationItem
              key={item.id}
              item={item}
              rail={rail}
              showLabels={showLabels}
              onNavigate={onNavigate}
            />
          ))}

          <UserMenu
            rail={rail}
            expanded={showLabels}
            popupWidth={FULL_WIDTH - 16}
          />
        </List>
      </Box>
    </Box>
  );
}
