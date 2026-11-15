import { Outlet } from 'react-router-dom';

import { Menu } from '@/components/Menu/Menu';

import { useNotifications } from '@/utils/hooks/useNotifications';
import { FOOTER_ITEMS, NAV_ITEMS } from '@/utils/navigation';

export function ContentLayout() {
  const { notifications, unreadCount, markRead, hideNotification } =
    useNotifications();

  return (
    <Menu
      items={NAV_ITEMS}
      footerItems={FOOTER_ITEMS}
      title='База стандартов и лучших практик'
      notifications={notifications}
      unreadNotificationsCount={unreadCount}
      onMarkNotificationRead={markRead}
      onHideNotification={hideNotification}
    >
      <Outlet />
    </Menu>
  );
}
