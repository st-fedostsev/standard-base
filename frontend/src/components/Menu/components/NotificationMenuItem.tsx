import { useId } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Typography,
} from '@mui/material';
import Close from '@mui/icons-material/Close';
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined';

import { EmptyState } from '@/components/EmptyState';

import type { NotificationItem } from '@/utils/types/notifications';

import { menuItemSx, railItemSx, revealSx } from './menuItemSx';

type NotificationMenuItemProps = {
  notifications: readonly NotificationItem[];
  unreadCount: number;

  open: boolean;
  onOpen: () => void;
  onClose: () => void;

  onMarkRead: (id: string) => void;
  onHide: (id: string) => void;

  /** Промежуточный режим меню с иконками. */
  rail: boolean;

  /** Показывать подпись пункта. */
  expanded: boolean;

  isMobile: boolean;
  sidebarWidth: number;
};

const PANEL_WIDTH = 360;

export function NotificationMenuItem({
  notifications,
  unreadCount,
  open,
  onOpen,
  onClose,
  onMarkRead,
  onHide,
  rail,
  expanded,
  isMobile,
  sidebarWidth,
}: NotificationMenuItemProps) {
  const navigate = useNavigate();
  const panelId = useId();

  // На мобильном экране панель открывается от левого края окна.
  const panelLeft = isMobile ? 0 : sidebarWidth;

  return (
    <>
      <ListItemButton
        sx={rail ? railItemSx : menuItemSx}
        selected={open}
        aria-label={
          unreadCount > 0
            ? `Уведомления, непрочитанных: ${unreadCount}`
            : 'Уведомления'
        }
        aria-haspopup='dialog'
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={onOpen}
      >
        <ListItemIcon>
          <Badge
            badgeContent={unreadCount}
            color='error'
            max={99}
            sx={{
              '& .MuiBadge-badge': {
                minWidth: 16,
                height: 16,
                padding: '0 3px',
                fontSize: 10,
                lineHeight: 1,
                transform: 'translate(25%, -25%)',
              },
            }}
          >
            <NotificationsNoneOutlined sx={{ fontSize: 24 }} />
          </Badge>
        </ListItemIcon>

        <ListItemText primary='Уведомления' sx={revealSx(expanded)} />
      </ListItemButton>

      <Popover
        open={open}
        onClose={onClose}
        anchorReference='anchorPosition'
        anchorPosition={{ top: 0, left: panelLeft }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        marginThreshold={0}
        slotProps={{
          paper: {
            id: panelId,
            role: 'dialog',
            'aria-label': 'Уведомления',
            sx: {
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
              width: PANEL_WIDTH,
              maxWidth: `calc(100vw - ${panelLeft}px)`,
              height: '100dvh',
              maxHeight: '100dvh',
              borderRadius: 0,
            },
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1,
          }}
        >
          <Typography variant='h6'>Уведомления</Typography>

          <IconButton aria-label='Закрыть уведомления' onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        <Divider />

        <Box sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <EmptyState
              icon={NotificationsNoneOutlined}
              description='У вас пока нет уведомлений'
            />
          ) : (
            <List disablePadding>
              {notifications.map((notification) => (
                <Box
                  component='li'
                  key={notification.id}
                  sx={{
                    listStyle: 'none',
                    px: 2,
                    py: 1.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: notification.isRead
                      ? 'transparent'
                      : 'action.hover',
                  }}
                >
                  <Typography
                    variant='subtitle2'
                    sx={{ fontWeight: notification.isRead ? 400 : 600 }}
                  >
                    {notification.title}
                  </Typography>

                  {notification.description && (
                    <Typography
                      variant='body2'
                      sx={{ color: 'text.secondary', mt: 0.5 }}
                    >
                      {notification.description}
                    </Typography>
                  )}

                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1,
                      mt: 1,
                    }}
                  >
                    {notification.type === 'action' && (
                      <Button
                        size='small'
                        variant='outlined'
                        onClick={() => {
                          onClose();
                          navigate(notification.action.to);
                        }}
                      >
                        {notification.action.label}
                      </Button>
                    )}

                    {!notification.isRead && (
                      <Button
                        size='small'
                        onClick={() => onMarkRead(notification.id)}
                      >
                        Прочитано
                      </Button>
                    )}

                    <Button
                      size='small'
                      onClick={() => onHide(notification.id)}
                    >
                      Скрыть
                    </Button>
                  </Box>
                </Box>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
}
