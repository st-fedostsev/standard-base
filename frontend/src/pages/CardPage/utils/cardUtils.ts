import {
  CARD_STATUS_LABELS,
  type CardAuthor,
  type CardRow,
} from '@/utils/types/cards';

export function getCardAuthorName(author: CardAuthor): string {
  return `${author.lastName} ${author.firstName}`;
}

export function canSendCardToReview(card: CardRow): boolean {
  return card.status === 'draft' || card.status === 'returned';
}

export function getCardSortValue(card: CardRow, key: string): string | number {
  switch (key) {
    case 'title':
      return card.title;

    case 'category':
      return card.category;

    case 'author':
      return getCardAuthorName(card.author);

    case 'status':
      return CARD_STATUS_LABELS[card.status];

    case 'created':
      return new Date(card.createAt).getTime();

    default:
      return '';
  }
}
