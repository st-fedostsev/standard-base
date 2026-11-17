import { useEffect, useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Badge,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CheckOutlined from '@mui/icons-material/CheckOutlined';
import Close from '@mui/icons-material/Close';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined';

import { EmptyState } from '@/components/EmptyState';
import { Loader } from '@/components/Loader/Loader';
import { useToast } from '@/components/Toast';

import { useAuth } from '@/utils/hooks/useAuth';
import { useNotifications } from '@/utils/hooks/useNotifications';
import type { NotificationItem } from '@/utils/types/notifications';

import { menuItemSx, railItemSx, revealSx } from './menuItemSx';

type NotificationMenuItemProps = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  rail: boolean;
  expanded: boolean;
  isMobile: boolean;
  sidebarWidth: number;
};

const PANEL_WIDTH = 360;
const NOTIFICATION_ROW_HEIGHT = 144;
const MAX_PAGE_SIZE = 20;

/** Переход разрешён только внутри приложения. */
function getInternalPath(value: string | null): string | null {
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

export function NotificationMenuItem({
  open,
  onOpen,
  onClose,
  rail,
  expanded,
  isMobile,
  sidebarWidth,
}: NotificationMenuItemProps) {
  const navigate = useNavigate();
  const panelId = useId();
  const { showToast } = useToast();

  const { user, isPending: isAuthPending, isError: isAuthError } = useAuth();

  const [listElement, setListElement] = useState<HTMLDivElement | null>(null);
  const [details, setDetails] = useState<NotificationItem | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState<number | null>(null);

  const {
    notifications,
    unreadCount,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    nextPage,
    previousPage,
    isLoading,
    isError,
    refetch,
    markRead,
    isMarkingRead,
  } = useNotifications(pageSize, page, open);

  // Измеряем высоту области списка и показываем только целое число строк.
  useEffect(() => {
    if (!open || !listElement) return;

    let timer: ReturnType<typeof setTimeout> | undefined;

    const measure = () => {
      const availableHeight = listElement.clientHeight;

      // Popover ещё может не завершить первоначальный layout.
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

  // При изменении размера страницы начинаем с первой страницы.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(0);
  }, [pageSize]);

  const panelLeft = isMobile ? 0 : sidebarWidth;

  const buttonLabel =
    unreadCount === undefined
      ? 'Уведомления'
      : unreadCount > 0
        ? `Уведомления, непрочитанных: ${unreadCount}`
        : 'Уведомления, нет непрочитанных';

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

  const visibleNotifications =
    pageSize === null ? [] : notifications.slice(0, pageSize);

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
            <NotificationsNoneOutlined />
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
            flexShrink: 0,
            gap: 1,
            px: 2,
            py: 1,
          }}
        >
          <Typography variant='h6' noWrap>
            Уведомления
          </Typography>

          <IconButton aria-label='Закрыть уведомления' onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        <Divider />

        {/* Область списка не прокручивается: показываем только влезающие строки. */}
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
              icon={NotificationsNoneOutlined}
              description='Не удалось проверить авторизацию.'
            />
          ) : !user ? (
            <EmptyState
              icon={NotificationsNoneOutlined}
              description='Войдите, чтобы посмотреть уведомления.'
            />
          ) : !user.id ? (
            <EmptyState
              icon={NotificationsNoneOutlined}
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
              icon={NotificationsNoneOutlined}
              description='Не удалось загрузить уведомления.'
              action={
                <Button variant='text' onClick={() => void refetch()}>
                  Повторить
                </Button>
              }
            />
          ) : notifications.length === 0 ? (
            <EmptyState
              icon={NotificationsNoneOutlined}
              description={
                page === 0
                  ? 'У вас пока нет уведомлений.'
                  : 'На этой странице нет уведомлений.'
              }
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
                const actionPath = getInternalPath(notification.actionUrl);

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
                      borderLeft: '3px solid',
                      borderLeftColor: notification.read
                        ? 'transparent'
                        : 'primary.main',
                      bgcolor: (theme) =>
                        notification.read
                          ? theme.palette.background.paper
                          : alpha(theme.palette.primary.main, 0.08),
                    }}
                  >
                    {/* Заголовок и состояние непрочитанного */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        minWidth: 0,
                      }}
                    >
                      <Typography
                        variant='subtitle2'
                        noWrap
                        sx={{
                          flexGrow: 1,
                          minWidth: 0,
                          fontWeight: notification.read ? 400 : 700,
                        }}
                      >
                        {notification.title}
                      </Typography>

                      {!notification.read && (
                        <Typography
                          variant='caption'
                          sx={{
                            flexShrink: 0,
                            color: 'primary.main',
                            fontWeight: 600,
                          }}
                        >
                          Новое
                        </Typography>
                      )}
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

                    {/* Действия внизу строки */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        mt: 'auto',
                        minWidth: 0,
                      }}
                    >
                      <Tooltip title='Подробнее'>
                        <IconButton
                          size='small'
                          aria-label={`Подробнее: ${notification.title}`}
                          onClick={() => setDetails(notification)}
                        >
                          <InfoOutlined fontSize='small' />
                        </IconButton>
                      </Tooltip>

                      {notification.actionLabel && actionPath && (
                        <Button
                          size='small'
                          variant='outlined'
                          onClick={() => {
                            onClose();
                            navigate(actionPath);
                          }}
                          sx={{ minWidth: 0, maxWidth: '100%' }}
                        >
                          <Typography component='span' variant='button' noWrap>
                            {notification.actionLabel}
                          </Typography>
                        </Button>
                      )}

                      {!notification.read && (
                        <Tooltip title='Отметить прочитанным'>
                          <span>
                            <IconButton
                              size='small'
                              aria-label={`Отметить прочитанным: ${notification.title}`}
                              disabled={isMarkingRead}
                              onClick={() => {
                                void handleMarkRead(notification.id);
                              }}
                            >
                              <CheckOutlined fontSize='small' />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </List>
          )}
        </Box>

        {/* Пагинация */}
        {user?.id && pageSize !== null && pageSize > 0 && (
          <>
            <Divider />

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
                gap: 1,
                px: 2,
                py: 1,
              }}
            >
              <Button
                size='small'
                onClick={previousPage}
                disabled={!hasPreviousPage || isLoading}
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
                disabled={!hasNextPage || isLoading}
              >
                Далее
              </Button>
            </Box>
          </>
        )}
      </Popover>

      {/* Полный текст уведомления */}
      <Dialog
        open={details !== null}
        onClose={() => setDetails(null)}
        fullWidth
        maxWidth='xs'
        aria-labelledby={`${panelId}-details-title`}
      >
        <DialogTitle id={`${panelId}-details-title`}>
          {details?.title}
        </DialogTitle>

        {details?.description && (
          <DialogContent dividers>
            <Typography
              sx={{
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
              }}
            >
              {details.description}
            </Typography>
          </DialogContent>
        )}

        <DialogActions sx={{ flexWrap: 'wrap' }}>
          {details?.actionLabel && getInternalPath(details.actionUrl) && (
            <Button
              onClick={() => {
                const path = getInternalPath(details.actionUrl);

                if (!path) return;

                setDetails(null);
                onClose();
                navigate(path);
              }}
            >
              {details.actionLabel}
            </Button>
          )}

          <Button onClick={() => setDetails(null)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
