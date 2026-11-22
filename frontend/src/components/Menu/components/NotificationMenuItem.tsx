import { useEffect, useId, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { EmptyState } from '@/components/EmptyState';
import { Loader } from '@/components/Loader/Loader';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/utils/hooks/useAuth';
import { useCurrentRole } from '@/utils/hooks/useCurrentRole';
import { useNotifications } from '@/utils/hooks/useNotifications';
import type { NotificationItem } from '@/utils/types/notifications';
import { ROLES } from '@/utils/types/roles';
import CheckOutlined from '@mui/icons-material/CheckOutlined';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Close from '@mui/icons-material/Close';
import Notifications from '@mui/icons-material/Notifications';
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
import { alpha } from '@mui/material/styles';

import { menuItemSx, railItemSx, revealSx } from './menuItemSx';

type NotificationMenuItemProps = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  rail: boolean;
  expanded: boolean;
  isMobile: boolean;
  sidebarWidth: number;
  onRegister?: () => void;
};

type NotificationActionFields = {
  actionUrl?: string | null;
  actionLabel?: string | null;
  action_url?: string | null;
  action_label?: string | null;
};

const PANEL_WIDTH = 360;
const NOTIFICATION_ROW_HEIGHT = 144;
const MAX_PAGE_SIZE = 20;
const SIDEBAR_GAP = 1;

function getInternalPath(value: string | null | undefined): string | null {
  if (!value) return null;

  try {
    const url = new URL(value, window.location.origin);

    if (url.origin !== window.location.origin) {
      return null;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

function getNotificationAction(notification: NotificationItem) {
  const item = notification as NotificationItem & NotificationActionFields;

  const label = item.action_label ?? item.actionLabel;
  const path = getInternalPath(item.action_url ?? item.actionUrl);

  return label && path ? { label, path } : null;
}

export function NotificationMenuItem({
  open,
  onOpen,
  onClose,
  rail,
  expanded,
  isMobile,
  sidebarWidth,
  onRegister,
}: NotificationMenuItemProps) {
  const navigate = useNavigate();
  const panelId = useId();
  const { showToast } = useToast();

  const { user, isPending: isAuthPending, isError: isAuthError } = useAuth();
  const role = useCurrentRole();
  const isGuest = role === ROLES.Guest;

  const [listElement, setListElement] = useState<HTMLDivElement | null>(null);
  const [pageSize, setPageSize] = useState<number | null>(null);

  const sidebarEdge = isMobile ? 0 : sidebarWidth;
  const panelLeft = isMobile ? 0 : sidebarEdge + SIDEBAR_GAP;

  const {
    notifications,
    unreadCount,
    totalPages,
    page,
    hasPreviousPage,
    hasNextPage,
    nextPage,
    previousPage,
    isLoading,
    isFetching,
    isError,
    refetch,
    markRead,
    markAllRead,
    isMarkingRead,
    isMarkingAllRead,
  } = useNotifications(pageSize, open);

  useEffect(() => {
    if (!open || !listElement) return;

    let timer: ReturnType<typeof setTimeout> | undefined;

    const measure = () => {
      const availableHeight = listElement.clientHeight;

      if (availableHeight <= 0) return;

      const nextSize = Math.min(
        MAX_PAGE_SIZE,
        Math.floor(availableHeight / NOTIFICATION_ROW_HEIGHT)
      );

      setPageSize((previous) => (previous === nextSize ? previous : nextSize));
    };

    const scheduleMeasure = () => {
      if (timer !== undefined) {
        clearTimeout(timer);
      }

      timer = setTimeout(measure, 100);
    };

    measure();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', scheduleMeasure);

      return () => {
        window.removeEventListener('resize', scheduleMeasure);

        if (timer !== undefined) {
          clearTimeout(timer);
        }
      };
    }

    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(listElement);

    return () => {
      observer.disconnect();

      if (timer !== undefined) {
        clearTimeout(timer);
      }
    };
  }, [open, listElement]);

  const buttonLabel =
    unreadCount === undefined
      ? 'Уведомления'
      : `Уведомления, непрочитанных: ${unreadCount}`;

  const handleMarkRead = async (id: string) => {
    try {
      await markRead(id);
    } catch {
      showToast({
        use: 'error',
        title: 'Не удалось отметить уведомление прочитанным',
        message: 'Попробуйте ещё раз.',
      });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
    } catch {
      showToast({
        use: 'error',
        title: 'Не удалось отметить уведомления прочитанными',
        message: 'Попробуйте ещё раз.',
      });
    }
  };

  const visibleNotifications =
    pageSize === null ? [] : notifications.slice(0, pageSize);

  const hasUnreadNotifications =
    (unreadCount ?? 0) > 0 ||
    notifications.some((notification) => !notification.read);

  const renderGuestEmptyState = (action?: ReactNode) => (
    <Box
      sx={{
        display: 'flex',
        height: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        px: 3,
        textAlign: 'center',
      }}
    >
      <Notifications sx={{ fontSize: 68, color: '#000' }} />

      <Typography
        sx={{
          maxWidth: 240,
          fontSize: 16,
          fontWeight: 700,
          lineHeight: 1.2,
          color: '#000',
        }}
      >
        У вас пока нет новых уведомлений
      </Typography>

      {action}
    </Box>
  );

  return (
    <>
      <ListItemButton
        sx={rail ? railItemSx : menuItemSx}
        selected={open}
        aria-label={buttonLabel}
        aria-haspopup='dialog'
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={open ? onClose : onOpen}
      >
        <ListItemIcon>
          <Badge
            badgeContent={unreadCount ?? 0}
            color='primary'
            max={99}
            invisible={!((unreadCount ?? 0) > 0)}
            overlap='circular'
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            sx={{
              '& .MuiBadge-badge': {
                minWidth: 18,
                height: 18,
                px: '4px',
                borderRadius: '9px',
                fontSize: 10,
                lineHeight: 1,
                fontWeight: 700,
                boxShadow: '0 0 0 2px #fff',
              },
            }}
          >
            <Notifications />
          </Badge>
        </ListItemIcon>

        <ListItemText primary='Уведомления' sx={revealSx(expanded)} />
      </ListItemButton>

      <Popover
        open={open}
        onClose={onClose}
        disableScrollLock
        anchorReference='anchorPosition'
        anchorPosition={{ top: 0, left: panelLeft }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        marginThreshold={0}
        slotProps={{
          backdrop: {
            invisible: false,
            sx: {
              left: `${sidebarEdge}px`,
              right: 0,
              top: 0,
              bottom: 0,
              bgcolor: alpha('#000', 0.32),
            },
          },
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
              overflow: 'hidden',
              borderRadius: 0,
              bgcolor: '#fff',
              boxShadow: 'none',
            },
          },
        }}
      >
        {/* Заголовок панели */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            height: 68,
            minHeight: 68,
            flexShrink: 0,
            gap: 1,
            px: 2,
          }}
        >
          <Typography
            variant='subtitle1'
            noWrap
            sx={{
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            Уведомления
          </Typography>

          <IconButton
            aria-label='Закрыть уведомления'
            onClick={onClose}
            size='small'
          >
            <Close />
          </IconButton>
        </Box>

        <Divider />

        {/* Список уведомлений */}
        <Box
          ref={setListElement}
          sx={{
            flex: '1 1 0',
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          {isAuthPending ? (
            <Loader label='Проверяем авторизацию...' />
          ) : isAuthError ? (
            <EmptyState
              icon={Notifications}
              description='Не удалось проверить авторизацию.'
            />
          ) : isGuest ? (
            renderGuestEmptyState(
              onRegister ? (
                <Button
                  variant='text'
                  onClick={onRegister}
                  endIcon={<ChevronRight />}
                  sx={{
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}
                >
                  Зарегистрироваться
                </Button>
              ) : null
            )
          ) : !user ? (
            <EmptyState
              icon={Notifications}
              description='Не удалось определить пользователя.'
            />
          ) : !user.id ? (
            <EmptyState
              icon={Notifications}
              description='Не удалось определить пользователя.'
            />
          ) : pageSize === null ? (
            <Loader label='Подготавливаем список...' />
          ) : pageSize === 0 ? (
            <Typography variant='body2' sx={{ p: 2, color: 'text.secondary' }}>
              Недостаточно места для отображения уведомлений.
            </Typography>
          ) : isLoading ? (
            <Loader label='Загружаем уведомления...' />
          ) : isError && notifications.length === 0 ? (
            <EmptyState
              icon={Notifications}
              description='Не удалось загрузить уведомления.'
              action={
                <Button variant='text' onClick={() => void refetch()}>
                  Повторить
                </Button>
              }
            />
          ) : notifications.length === 0 ? (
            <EmptyState
              icon={Notifications}
              description='У вас пока нет новых уведомлений.'
            />
          ) : (
            <List
              disablePadding
              sx={{
                height: '100%',
                overflow: 'hidden',
              }}
            >
              {visibleNotifications.map((notification) => {
                const action = getNotificationAction(notification);

                return (
                  <Box
                    component='li'
                    key={notification.id}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      boxSizing: 'border-box',
                      height: NOTIFICATION_ROW_HEIGHT,
                      maxHeight: NOTIFICATION_ROW_HEIGHT,
                      overflow: 'hidden',
                      listStyle: 'none',
                      px: 2,
                      py: 1.5,
                      borderBottom: '1px solid',
                      borderBottomColor: 'divider',
                      bgcolor: notification.read
                        ? '#fff'
                        : alpha('#1976D2', 0.08),
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        minWidth: 0,
                      }}
                    >
                      {!notification.read && (
                        <Box
                          aria-label='Новое уведомление'
                          sx={{
                            width: 7,
                            height: 7,
                            flexShrink: 0,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                          }}
                        />
                      )}

                      <Typography
                        variant='subtitle2'
                        noWrap
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          fontWeight: 700,
                        }}
                      >
                        {notification.title}
                      </Typography>
                    </Box>

                    {notification.description && (
                      <Typography
                        variant='body2'
                        sx={{
                          mt: 0.5,
                          color: 'text.secondary',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {notification.description}
                      </Typography>
                    )}

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 1,
                        mt: 'auto',
                        minWidth: 0,
                      }}
                    >
                      {action && (
                        <Button
                          size='small'
                          variant='outlined'
                          onClick={() => {
                            onClose();
                            navigate(action.path);
                          }}
                          sx={{ minWidth: 0, maxWidth: '100%' }}
                        >
                          <Typography component='span' variant='button' noWrap>
                            {action.label}
                          </Typography>
                        </Button>
                      )}

                      {notification.read ? (
                        <Typography
                          variant='caption'
                          sx={{
                            color: 'primary.main',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Прочитано ✓✓
                        </Typography>
                      ) : (
                        <Button
                          size='small'
                          variant='text'
                          startIcon={<CheckOutlined />}
                          disabled={isMarkingRead || isMarkingAllRead}
                          onClick={() => void handleMarkRead(notification.id)}
                          sx={{ whiteSpace: 'nowrap' }}
                        >
                          Прочитать
                        </Button>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </List>
          )}
        </Box>

        {/* Кнопка «Прочитать всё» и пагинация внизу панели. */}
        {user?.id && !isGuest && pageSize !== null && pageSize > 0 && (
          <Box sx={{ flexShrink: 0 }}>
            {hasUnreadNotifications && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  px: 2,
                  py: 1,
                }}
              >
                <Button
                  size='small'
                  variant='outlined'
                  disabled={isMarkingAllRead}
                  onClick={() => void handleMarkAllRead()}
                >
                  Прочитать всё
                </Button>
              </Box>
            )}

            <Divider />

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
                px: 2,
                py: 1,
              }}
            >
              <Button
                size='small'
                onClick={previousPage}
                disabled={!hasPreviousPage || isFetching}
              >
                Назад
              </Button>

              <Typography
                variant='body2'
                sx={{
                  color: 'text.secondary',
                  whiteSpace: 'nowrap',
                }}
              >
                {totalPages === undefined
                  ? `Страница ${page + 1}`
                  : `${page + 1} / ${totalPages}`}
              </Typography>

              <Button
                size='small'
                onClick={nextPage}
                disabled={!hasNextPage || isFetching}
              >
                Далее
              </Button>
            </Box>
          </Box>
        )}
      </Popover>
    </>
  );
}
