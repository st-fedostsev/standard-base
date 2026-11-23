import { useCurrentRole } from '@/utils/hooks/useCurrentRole';
import type { NavItem } from '@/utils/types/navigation';
import { hasAccess } from '@/utils/types/roles';
import { Box, Divider, List } from '@mui/material';

import { MainMenuHeader } from './MainMenuHeader';
import { MenuNavigationItem } from './MenuNavigationItem';
import { NotificationMenuItem } from './NotificationMenuItem';
import { UserMenu } from './UserMenu';

import styles from '../Menu.module.css';

export const RAIL_WIDTH = 64;
export const FULL_WIDTH = 289;

type SidebarContentProps = {
  items: NavItem[];
  footerItems: NavItem[];
  title?: string;

  rail: boolean;
  showLabels: boolean;
  isMobile: boolean;

  notificationsOpen: boolean;
  onOpenNotifications: () => void;
  onCloseNotifications: () => void;

  onNavigate: () => void;
  onRegister: () => void;
};

export function SidebarContent({
  items,
  footerItems,
  title,
  rail,
  showLabels,
  isMobile,
  notificationsOpen,
  onOpenNotifications,
  onCloseNotifications,
  onNavigate,
  onRegister,
}: SidebarContentProps) {
  const role = useCurrentRole();

  const visibleItems = items.filter((item) => hasAccess(role, item.roles));

  const visibleFooterItems = footerItems.filter((item) =>
    hasAccess(role, item.roles)
  );

  return (
    <Box
      className={styles.content}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        minHeight: 0,
        boxSizing: 'border-box',
      }}
    >
      <MainMenuHeader title={title} showLabels={showLabels} />

      <Divider className={styles.menuDivider} />

      <List
        component='div'
        disablePadding
        className={styles.body}
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <NotificationMenuItem
          open={notificationsOpen}
          onOpen={onOpenNotifications}
          onClose={onCloseNotifications}
          rail={rail}
          expanded={showLabels}
          isMobile={isMobile}
          sidebarWidth={FULL_WIDTH}
          onRegister={onRegister}
        />

        {visibleItems.map((item) => (
          <MenuNavigationItem
            key={item.id}
            item={item}
            rail={rail}
            showLabels={showLabels}
            onNavigate={onNavigate}
            notificationsOpen={notificationsOpen}
          />
        ))}
      </List>

      <Box
        sx={{
          width: '100%',
          mt: 'auto',
          flexShrink: 0,
          px: 1,
          pt: 1,
          pb: 2,
          boxSizing: 'border-box',
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
              notificationsOpen={notificationsOpen}
            />
          ))}

          <UserMenu rail={rail} expanded={showLabels} popupWidth={220} />
        </List>
      </Box>
    </Box>
  );
}
