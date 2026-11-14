import BookmarkBorderOutlined from '@mui/icons-material/BookmarkBorderOutlined';
import EditNoteOutlined from '@mui/icons-material/EditNoteOutlined';
import FactCheckOutlined from '@mui/icons-material/FactCheckOutlined';
import HistoryOutlined from '@mui/icons-material/HistoryOutlined';
import LibraryBooksOutlined from '@mui/icons-material/LibraryBooksOutlined';
import MenuBookOutlined from '@mui/icons-material/MenuBookOutlined';
import PeopleOutlined from '@mui/icons-material/PeopleOutlined';

import type { NavItem } from '@/utils/types/navigation';

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'catalog',
    label: 'Каталог',
    to: '/',
    icon: LibraryBooksOutlined,
    roles: ['guest', 'auth_guest', 'author', 'admin'],
  },
  {
    id: 'bookmarks',
    label: 'Закладки',
    to: '/bookmarks',
    icon: BookmarkBorderOutlined,
    roles: ['guest', 'auth_guest', 'author', 'admin'],
  },
  {
    id: 'my_cards',
    label: 'Карточки',
    to: '/cards',
    icon: EditNoteOutlined,
    roles: ['guest', 'auth_guest', 'author', 'admin'],
  },
  {
    id: 'moderation',
    label: 'На согласовании',
    to: '/moderation',
    icon: FactCheckOutlined,
    roles: ['guest', 'auth_guest', 'author', 'admin'],
  },
  {
    id: 'users',
    label: 'Пользователи',
    to: '/users',
    icon: PeopleOutlined,
    roles: ['guest', 'auth_guest', 'author', 'admin'],
  },
  {
    id: 'events_page',
    label: 'Журнал событий',
    to: '/events',
    icon: HistoryOutlined,
    roles: ['guest', 'auth_guest', 'author', 'admin'],
  },
];

/** Пункты внизу меню. Выглядят так же, как основные. */
export const FOOTER_ITEMS: NavItem[] = [
  {
    id: 'docs',
    label: 'Документация',
    href: '#',
    icon: MenuBookOutlined,
  },
];
