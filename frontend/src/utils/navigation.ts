import type { NavItem } from '@/utils/types/navigation';
import FactCheckOutlined from '@mui/icons-material/FactCheckOutlined';
import FolderOpenOutlined from '@mui/icons-material/FolderOpenOutlined';
import HelpOutlined from '@mui/icons-material/HelpOutlined';
import HistoryOutlined from '@mui/icons-material/HistoryOutlined';
import HomeOutlined from '@mui/icons-material/HomeOutlined';
import PeopleOutlined from '@mui/icons-material/PeopleOutlined';

import { ROLES } from './types/roles';

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'main',
    label: 'Главная',
    to: '/',
    icon: HomeOutlined,
    roles: Object.values(ROLES),
  },
  {
    id: 'base',
    label: 'Стандарты и практики',
    to: '/base',
    icon: FolderOpenOutlined,
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
    icon: HelpOutlined,
  },
];
