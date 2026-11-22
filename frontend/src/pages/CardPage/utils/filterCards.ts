import type { CardCategory, CardFilters, CardRow } from '@/utils/types/cards';

export function filterCards(
  cards: CardRow[],
  filters: CardFilters,
  categories: CardCategory[]
): CardRow[] {
  const query = filters.search.trim().toLocaleLowerCase('ru');
  const { from, to } = filters.created;

  // Фильтр хранит ID, CardRow пока содержит название категории.
  const selectedCategoryNames = new Set(
    categories
      .filter((category) => filters.category.includes(category.id))
      .map((category) => category.name)
  );

  return cards.filter((card) => {
    const createdDay = card.createAt.slice(0, 10);

    const matchesCategory =
      filters.category.length === 0 || selectedCategoryNames.has(card.category);

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
