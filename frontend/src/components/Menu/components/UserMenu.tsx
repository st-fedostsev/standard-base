import { useEffect, useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Avatar,
  Divider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';

import { useAuth } from '@/utils/hooks/useAuth';
import { ROLE_LABELS } from '@/utils/types/roles';

import { menuDividerSx, menuItemSx, railItemSx, revealSx } from './menuItemSx';

type UserMenuProps = {
  rail: boolean;
  expanded: boolean;
  popupWidth: number;
};

export function UserMenu({ rail, expanded, popupWidth }: UserMenuProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const menuId = useId();

  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const [logoutError, setLogoutError] = useState(false);

  const firstName = user?.firstName?.trim() ?? '';
  const lastName = user?.lastName?.trim() ?? '';

  const initials = `${lastName.charAt(0)}${firstName.charAt(0)}`;

  const name = user
    ? [lastName, firstName ? `${firstName.charAt(0)}.` : '']
        .filter(Boolean)
        .join(' ') || 'Пользователь'
    : 'Гость';

  const roleLabel = user
    ? (ROLE_LABELS[user.role] ?? 'Неизвестная роль')
    : 'Не вошли';

  const close = () => {
    setIsOpen(false);

    // Возвращаем фокус без прокрутки страницы к кнопке аватарки.
    requestAnimationFrame(() => {
      if (anchor?.isConnected) {
        anchor.focus({ preventScroll: true });
      }
    });
  };

  // Закрываем попап при прокрутке страницы или вложенного контейнера.
  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = (event: Event) => {
      const menuElement = document.getElementById(menuId);

      // Прокрутка внутри самого попапа не закрывает его.
      if (event.target instanceof Node && menuElement?.contains(event.target)) {
        return;
      }

      setIsOpen(false);

      requestAnimationFrame(() => {
        if (anchor?.isConnected) {
          anchor.focus({ preventScroll: true });
        }
      });
    };

    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [anchor, isOpen, menuId]);

  const handleLogout = async () => {
    if (logoutPending) return;

    setLogoutPending(true);
    setLogoutError(false);

    try {
      await logout();
      setIsOpen(false);
      navigate('/', { replace: true });
    } catch {
      setLogoutError(true);
    } finally {
      setLogoutPending(false);
    }
  };

  return (
    <>
      <ListItemButton
        sx={rail ? railItemSx : menuItemSx}
        selected={isOpen}
        aria-label='Меню пользователя'
        aria-haspopup='menu'
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={(event) => {
          setAnchor(event.currentTarget);
          setLogoutError(false);
          setIsOpen(true);
        }}
      >
        <ListItemIcon>
          <Avatar
            src={user?.avatarUrl ?? undefined}
            alt=''
            sx={{
              width: 24,
              height: 24,
              fontSize: 12,
            }}
          >
            {initials || undefined}
          </Avatar>
        </ListItemIcon>

        <ListItemText
          primary={name}
          secondary={roleLabel}
          sx={revealSx(expanded)}
        />
      </ListItemButton>

      <Menu
        id={menuId}
        anchorEl={anchor}
        open={isOpen}
        onClose={close}
        disableScrollLock
        disableRestoreFocus
        marginThreshold={0}
        transitionDuration={0}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              width: popupWidth,
              maxHeight: 'calc(100dvh - 32px)',
              boxSizing: 'border-box',
              borderRadius: 2,
            },
          },
          list: {
            sx: {
              px: 1,
              py: 1,
            },
          },
        }}
      >
        {user ? (
          [
            <MenuItem
              key='profile'
              sx={menuItemSx}
              onClick={() => {
                setIsOpen(false);
                navigate('/profile');
              }}
            >
              Личный кабинет
            </MenuItem>,

            <Divider key='divider' sx={menuDividerSx} />,

            <MenuItem
              key='logout'
              sx={menuItemSx}
              disabled={logoutPending}
              onClick={() => void handleLogout()}
            >
              {logoutPending ? 'Выход...' : 'Выйти'}
            </MenuItem>,

            ...(logoutError
              ? [
                  <MenuItem key='logout-error' disabled>
                    Не удалось выполнить выход
                  </MenuItem>,
                ]
              : []),
          ]
        ) : (
          <MenuItem
            sx={menuItemSx}
            onClick={() => {
              setIsOpen(false);
              navigate('/login');
            }}
          >
            Войти
          </MenuItem>
        )}
      </Menu>
    </>
  );
}
