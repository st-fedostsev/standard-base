import {
  CARD_STATUS_OPTIONS,
  type CardAuthor,
  type CardCategory,
} from '@/utils/types/cards';
import type { FilterDef } from '@/utils/types/filters';
import { ROLES } from '@/utils/types/roles';

import { getCardAuthorName } from './cardUtils';

export function createCardFilterDefs(
  categories: CardCategory[],
  authors: CardAuthor[]
): FilterDef[] {
  return [
    {
      type: 'dateRange',
      key: 'created',
      fromLabel: 'Создано с',
      toLabel: 'по',
    },
    {
      type: 'search',
      key: 'search',
      placeholder: 'Поиск по названию',
    },
    {
      type: 'multiselect',
      key: 'status',
      label: 'Статус',
      options: CARD_STATUS_OPTIONS,
      width: 200,
    },
    {
      type: 'multiselect',
      key: 'category',
      label: 'Категория',
      options: categories.map((category) => ({
        value: category.id,
        label: category.name,
      })),
      width: 200,
    },
    {
      type: 'multiselect',
      key: 'authorIds',
      label: 'Автор',
      options: authors.map((author) => ({
        value: author.id,
        label: getCardAuthorName(author),
      })),
      searchable: true,
      roles: [ROLES.Admin],
      width: 220,
    },
  ];
}
