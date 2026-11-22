import {
  CARD_STATUS_LABELS,
  type CardAuthor,
  type CardCategory,
  type CardFilters,
  type CardRow,
} from '@/utils/types/cards';

export function getCardAuthorName(author: CardAuthor): string {
  return `${author.lastName} ${author.firstName}`;
}

export function canSendCardToReview(card: CardRow): boolean {
  return card.status === 'draft' || card.status === 'returned';
}

/**
 * Дополнительная фильтрация на клиенте: серверный API принимает одно значение
 * status/category, а UI позволяет выбрать несколько.
 */
export function filterCards(
  cards: CardRow[],
  filters: CardFilters,
  categories: CardCategory[]
): CardRow[] {
  const query = filters.search.trim().toLocaleLowerCase('ru');
  const { from, to } = filters.created;

  const selectedCategoryNames = new Set(
    categories
      .filter((category) => filters.category.includes(category.id))
      .map((category) => category.name)
  );

  return cards.filter((card) => {
    // CardRow.category сейчас хранит название категории.
    // Если API начнёт возвращать category_id, заменим это сравнение на ID.
    const matchesCategory =
      filters.category.length === 0 ||
      filters.category.some(
        (categoryId) =>
          categoryId === card.category ||
          selectedCategoryNames.has(card.category)
      );

    // В API поле пока называется createAt; оставляем его до подтверждения контракта.
    const createdDay = card.createAt.slice(0, 10);

    return (
      (query === '' || card.title.toLocaleLowerCase('ru').includes(query)) &&
      (filters.status.length === 0 || filters.status.includes(card.status)) &&
      matchesCategory &&
      (filters.authorIds.length === 0 ||
        filters.authorIds.includes(card.author.id)) &&
      (from === '' || createdDay >= from) &&
      (to === '' || createdDay <= to)
    );
  });
}

export function countLabel(
  hasFilters: boolean,
  visibleCount: number,
  totalCount: number
): string {
  return hasFilters ? `Найдено: ${visibleCount}` : `Материалов: ${totalCount}`;
}

/** Формирует колонки и сортирует автора по фамилии и имени. */
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
