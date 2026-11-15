import FactCheckOutlined from '@mui/icons-material/FactCheckOutlined';
import HistoryOutlined from '@mui/icons-material/HistoryOutlined';
import LibraryBooksOutlined from '@mui/icons-material/LibraryBooksOutlined';
import MenuBookOutlined from '@mui/icons-material/MenuBookOutlined';
import PeopleOutlined from '@mui/icons-material/PeopleOutlined';

import type { NavItem } from '@/utils/types/navigation';

import { ROLES } from './types/roles';

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'catalog',
    label: 'Каталог',
    to: '/',
    icon: LibraryBooksOutlined,
    roles: Object.values(ROLES),
  },
  {
    id: 'moderation',
    label: 'На согласовании',
    to: '/moderation',
    icon: FactCheckOutlined,
    roles: [ROLES.Author, ROLES.Admin],
  },
  {
    id: 'users',
    label: 'Пользователи',
    to: '/users',
    icon: PeopleOutlined,
    roles: [ROLES.Admin],
  },
  {
    id: 'events_page',
    label: 'Журнал событий',
    to: '/events',
    icon: HistoryOutlined,
    roles: [ROLES.Admin],
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
