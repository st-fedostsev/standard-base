import type { CardCategory, CardFilters, CardRow } from '@/utils/types/cards';

export function filterCards(
  cards: CardRow[],
  filters: CardFilters,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _categories: CardCategory[]
): CardRow[] {
  const query = filters.search.trim().toLocaleLowerCase('ru');
  const { from, to } = filters.created;

  return cards.filter((card) => {
    const createdDay = card.createdAt.slice(0, 10);

    return (
      (query === '' || card.title.toLocaleLowerCase('ru').includes(query)) &&
      (filters.status.length === 0 || filters.status.includes(card.status)) &&
      (filters.category.length === 0 ||
        filters.category.includes(card.category.id)) &&
      (filters.authorIds.length === 0 ||
        filters.authorIds.includes(card.author.id)) &&
      (from === '' || createdDay >= from) &&
      (to === '' || createdDay <= to)
    );
  });
}
