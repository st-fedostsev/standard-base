import FolderOpenOutlined from '@mui/icons-material/FolderOpenOutlined';
import FactCheckOutlined from '@mui/icons-material/FactCheckOutlined';
import HelpOutlined from '@mui/icons-material/HelpOutlined';
import HistoryOutlined from '@mui/icons-material/HistoryOutlined';
import PersonOutlined from '@mui/icons-material/PersonOutlined';

import type { NavItem } from '@/utils/types/navigation';

import { ROLES } from './types/roles';

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'catalog',
    label: 'Реестр решений',
    to: '/',
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
    icon: PersonOutlined,
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
