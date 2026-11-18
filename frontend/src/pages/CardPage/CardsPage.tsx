import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';

import { Button, Chip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import SearchOffOutlined from '@mui/icons-material/SearchOffOutlined';
import SendOutlined from '@mui/icons-material/SendOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';

import { AddCardModal } from '@/components/Modals/AddCardModal';
import {
  CellLines,
  DataTable,
  SORT_LABELS,
  type Column,
} from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { FilterBar } from '@/components/FilterBar';
import { MassActionsPanel } from '@/components/MassActionsPanel';
import { PageLayout } from '@/components/PageLayout';
import { PermissionGuard } from '@/components/PermissionGuard';

import { MOCK_CARDS } from '@/utils/mocks/cards';
import {
  CARD_CATEGORY_OPTIONS,
  CARD_STATUS_LABELS,
  CARD_STATUS_OPTIONS,
  DEFAULT_CARD_FILTERS,
  type CardAuthor,
  type CardFilters,
  type CardRow,
} from '@/utils/types/cards';
import { isFiltered, type FilterDef } from '@/utils/types/filters';
import { ROLES } from '@/utils/types/roles';

// Мок-данные: временно, до появления эндпоинта. Перед коммитом поставьте USE_MOCK = false
const USE_MOCK = true;

// Общий пустой массив, чтобы useMemo не пересчитывался на каждом рендере
const NO_CARDS: CardRow[] = [];

const authorName = (a: CardAuthor) => `${a.lastName} ${a.firstName}`;

const columns: Column<CardRow>[] = [
  {
    key: 'title',
    title: 'Название',
    sortValue: (c) => c.title,
    sortLabels: SORT_LABELS.text,
    render: (c) => <CellLines primary={c.title} secondary={`ID ${c.id}`} />,
  },
  {
    key: 'category',
    title: 'Категория',
    width: 180,
    sortValue: (c) => c.category,
    sortLabels: SORT_LABELS.text,
    render: (c) => <Typography variant='body2'>{c.category}</Typography>,
  },
  {
    key: 'author',
    title: 'Автор',
    width: 260,
    sortValue: (c) => authorName(c.author),
    sortLabels: SORT_LABELS.text,
    render: (c) => (
      <CellLines
        primary={authorName(c.author)}
        secondary={`ID ${c.author.id}`}
      />
    ),
  },
  {
    key: 'status',
    title: 'Статус',
    width: 200,
    sortValue: (c) => CARD_STATUS_LABELS[c.status],
    sortLabels: SORT_LABELS.text,
    render: (c) => (
      <Chip
        size='small'
        variant='outlined'
        label={CARD_STATUS_LABELS[c.status]}
      />
    ),
  },
];

// Отправить можно черновик и возвращённый материал
const canSendToReview = (card: CardRow) =>
  card.status === 'draft' || card.status === 'returned';

/**
 * Фильтрация на клиенте. Только для заглушки: с backend фильтры уходят в
 * запрос.
 */
function filterCards(cards: CardRow[], f: CardFilters): CardRow[] {
  const q = f.search.trim().toLowerCase();
  const { from, to } = f.created;
  return cards.filter((c) => {
    const day = c.createAt.slice(0, 10);
    return (
      (q === '' || c.title.toLowerCase().includes(q)) &&
      (f.status.length === 0 || f.status.includes(c.status)) &&
      (f.category === 'all' || c.category === f.category) &&
      (f.authorId === 'all' || c.author.id === f.authorId) &&
      (from === '' || day >= from) &&
      (to === '' || day <= to)
    );
  });
}

export function CardsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<CardFilters>(DEFAULT_CARD_FILTERS);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [addCardOpen, setAddCardOpen] = useState(false);

  const {
    data: cards = NO_CARDS,
    isPending,
    isError,
  } = useQuery<CardRow[]>({
    queryKey: ['cards'],
    queryFn: async () => {
      if (USE_MOCK) {
        // Задержка нужна, чтобы увидеть скелетоны загрузки
        await new Promise((resolve) => setTimeout(resolve, 400));
        return MOCK_CARDS;
      }
      // TODO: запрос к backend. Фильтры передать в параметры и добавить в queryKey
      return [];
    },
  });

  const rows = useMemo(() => filterCards(cards, filters), [cards, filters]);

  // Авторы для фильтра: уникальные из загруженных данных. С backend придёт справочник
  const authors = useMemo(() => {
    const byId = new Map<string, CardAuthor>();
    cards.forEach((c) => byId.set(c.author.id, c.author));
    return [...byId.values()].sort((a, b) =>
      authorName(a).localeCompare(authorName(b), 'ru')
    );
  }, [cards]);

  const selectedRows = useMemo(
    () => cards.filter((c) => selected.has(c.id)),
    [cards, selected]
  );
  const allSendable =
    selectedRows.length > 0 && selectedRows.every(canSendToReview);

  // Выбор привязан к видимым строкам: любое изменение фильтра его сбрасывает
  const changeFilters = (next: CardFilters) => {
    setFilters(next);
    setSelected(new Set());
  };

  const hasFilters = isFiltered(filters, DEFAULT_CARD_FILTERS);

  // Отправка на согласование для набора id. Эти строки снимаются из выбора
  const sendToReview = (ids: string[]) => {
    // TODO: запрос к backend, например POST /api/cards/send-to-review с ids
    setSelected((prev) => new Set([...prev].filter((id) => !ids.includes(id))));
  };

  // Порядок полей на панели задаёт порядок этого массива
  const filterDefs: FilterDef[] = [
    {
      type: 'dateRange',
      key: 'created',
      fromLabel: 'Создано с',
      toLabel: 'по',
    },
    { type: 'search', key: 'search', placeholder: 'Поиск по названию' },
    {
      type: 'multiselect',
      key: 'status',
      label: 'Статус',
      options: CARD_STATUS_OPTIONS,
      width: 220,
    },
    {
      type: 'select',
      key: 'category',
      label: 'Категория',
      allLabel: 'Все категории',
      options: CARD_CATEGORY_OPTIONS,
    },
    {
      type: 'select',
      key: 'authorId',
      label: 'Автор',
      allLabel: 'Все авторы',
      options: authors.map((a) => ({ value: a.id, label: authorName(a) })),
      roles: [ROLES.Admin],
    },
  ];

  const counter = hasFilters
    ? `Найдено: ${rows.length} из ${cards.length}`
    : `Материалов: ${cards.length}`;

  const emptyState = hasFilters ? (
    <EmptyState
      icon={SearchOffOutlined}
      description='По выбранным условиям ничего не найдено. Измените фильтры или сбросьте их.'
      action={
        <Button
          variant='text'
          onClick={() => changeFilters(DEFAULT_CARD_FILTERS)}
        >
          Сбросить фильтры
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={DescriptionOutlined}
      description='Здесь будут ваши материалы. Создайте первый, чтобы начать.'
      action={
        <PermissionGuard allowed={[ROLES.Author, ROLES.Admin]}>
          <Button
            variant='outlined'
            startIcon={<AddIcon />}
            onClick={() => setAddCardOpen(true)}
          >
            Создать материал
          </Button>
        </PermissionGuard>
      }
    />
  );

  return (
    <PageLayout
      title='Карточки'
      subtitle={isPending ? undefined : counter}
      actions={
        <PermissionGuard allowed={[ROLES.Guest, ROLES.Author, ROLES.Admin]}>
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={() => setAddCardOpen(true)}
          >
            Создать материал
          </Button>
        </PermissionGuard>
      }
      filters={
        <FilterBar
          defs={filterDefs}
          value={filters}
          defaults={DEFAULT_CARD_FILTERS}
          onChange={changeFilters}
        />
      }
    >
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(c) => c.id}
        selectedIds={selected}
        onSelectedIdsChange={setSelected}
        onRowClick={(c) => navigate(`/cards/${c.id}`)}
        massActionsPanel={({ count, selectAll, clear }) => (
          <MassActionsPanel
            count={count}
            onClear={clear}
            onSelectAll={selectAll}
            actions={[
              {
                id: 'send',
                label: 'Хз че писать пока',
                icon: SendOutlined,
                disabled: !allSendable,
                onClick: () => sendToReview([...selected]),
              },
            ]}
          />
        )}
        kebabMenu={(c) => [
          {
            id: 'open',
            label: 'Открыть',
            icon: VisibilityOutlined,
            onClick: () => navigate(`/cards/${c.id}`),
          },
          {
            id: 'send',
            label: 'Хз че писать пока',
            icon: SendOutlined,
            roles: [ROLES.Author, ROLES.Admin],
            disabled: !canSendToReview(c),
            onClick: () => sendToReview([c.id]),
          },
        ]}
        isLoading={isPending}
        errorText={
          isError ? 'Не удалось загрузить данные. Попробуйте позже' : undefined
        }
        empty={emptyState}
      />

      <AddCardModal
        open={addCardOpen}
        onClose={() => setAddCardOpen(false)}
        // Пока без сохранения: после проверки формы просто закрываем окно
        onSubmit={() => setAddCardOpen(false)}
      />
    </PageLayout>
  );
}
