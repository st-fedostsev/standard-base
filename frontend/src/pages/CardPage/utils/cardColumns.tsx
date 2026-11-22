import { CellLines, SORT_LABELS, type Column } from '@/components/DataTable';
import { CARD_STATUS_LABELS, type CardRow } from '@/utils/types/cards';
import { Chip } from '@mui/material';

import { getCardAuthorName } from './cardUtils';

export const CARD_COLUMNS: Column<CardRow>[] = [
  {
    key: 'title',
    title: 'Название',
    sortValue: (card) => card.title,
    sortLabels: SORT_LABELS.text,
    render: (card) => (
      <CellLines primary={card.title} secondary={`ID ${card.id}`} />
    ),
  },
  {
    key: 'category',
    title: 'Категория',
    width: 180,
    sortValue: (card) => card.category,
    sortLabels: SORT_LABELS.text,
    render: (card) => (
      <Chip size='small' variant='filled' label={card.category} />
    ),
  },
  {
    key: 'author',
    title: 'Автор',
    width: 260,
    sortValue: (card) => getCardAuthorName(card.author),
    sortLabels: SORT_LABELS.text,
    render: (card) => (
      <CellLines
        primary={getCardAuthorName(card.author)}
        secondary={`ID ${card.author.id}`}
      />
    ),
  },
  {
    key: 'status',
    title: 'Статус',
    width: 200,
    sortValue: (card) => CARD_STATUS_LABELS[card.status],
    sortLabels: SORT_LABELS.text,
    render: (card) => (
      <Chip
        size='small'
        variant='filled'
        label={CARD_STATUS_LABELS[card.status]}
      />
    ),
  },
];
