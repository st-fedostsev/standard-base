import { useEffect, useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/utils/hooks/useAuth';
import { ROLE_LABELS } from '@/utils/types/roles';
import {
  Avatar,
  Divider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';

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

    requestAnimationFrame(() => {
      if (anchor?.isConnected) {
        anchor.focus({ preventScroll: true });
      }
    });
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = (event: Event) => {
      const menuElement = document.getElementById(menuId);

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
      navigate('/base', { replace: true });
    } catch {
      setLogoutError(true);
    } finally {
      setLogoutPending(false);
    }
  };

  return (
    <>
      <ListItemButton
        sx={{
          ...(rail ? railItemSx : menuItemSx),

          // Родительский блок уже имеет горизонтальные отступы.
          // Не добавляем к ним ещё одни.
          width: '100%',
          mx: 0,

          // Одинаковый внутренний отступ в обоих режимах.
          px: 1.5,

          display: 'grid',
          gridTemplateColumns: '36px minmax(0, 1fr)',
          alignItems: 'center',
          columnGap: 0,

          '& .MuiListItemIcon-root': {
            gridColumn: 1,
            minWidth: 36,
            width: 36,
            m: 0,
          },

          '& .MuiListItemText-root': {
            gridColumn: 2,
            minWidth: 0,
          },
        }}
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
        <ListItemIcon
          sx={{
            minWidth: 36,
            flexShrink: 0,
          }}
        >
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
