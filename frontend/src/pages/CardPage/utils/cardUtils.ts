import {
  CARD_STATUS_LABELS,
  type CardAuthor,
  type CardRow,
} from '@/utils/types/cards';

export function getCardAuthorName(author: CardAuthor): string {
  return [author.last_name, author.first_name, author.patronymic]
    .filter(Boolean)
    .join(' ');
}

export function canSendCardToReview(card: CardRow): boolean {
  return card.status === 'draft' || card.status === 'returned';
}

export function getCardSortValue(card: CardRow, key: string): string | number {
  switch (key) {
    case 'title':
      return card.title;

    case 'category':
      return card.category.name;

    case 'author':
      return getCardAuthorName(card.author);

    case 'status':
      return CARD_STATUS_LABELS[card.status];

    case 'created':
      return new Date(card.created_at).getTime();

    default:
      return '';
  }
}
