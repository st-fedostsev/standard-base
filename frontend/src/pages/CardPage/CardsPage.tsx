import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';

import { Button, Chip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import SearchOffOutlined from '@mui/icons-material/SearchOffOutlined';
import SendOutlined from '@mui/icons-material/SendOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';

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

// GUID в моках выдуманы. С backend придут настоящие
const AUTHOR_STEPAN: CardAuthor = {
  id: '5f2c8a1e-3b7d-4e9a-8c61-0d4b2e7f9a13',
  firstName: 'Степан',
  lastName: 'Федосцев',
};

const MOCK_CARDS: CardRow[] = [
  {
    id: 'e1a7c3d9-4b2f-4f6e-9a18-7c5d0b3e2f61',
    title: 'Правила оформления материала',
    category: 'Процессы',
    author: AUTHOR_STEPAN,
    status: 'published',
    updatedAt: '2026-10-28T09:15:00',
  },
  {
    id: '2f8b5e0c-6d1a-4c7b-8e93-1a4f7d2c5b08',
    title: 'Чек-лист перед публикацией',
    category: 'Инструменты',
    author: AUTHOR_STEPAN,
    status: 'draft',
    updatedAt: '2026-11-02T14:40:00',
  },
  {
    id: '7d3c9a6f-0e5b-4b1d-a2c8-5f7e9b4d1a72',
    title: 'Пример: сокращение времени переналадки',
    category: 'Показатели',
    author: AUTHOR_STEPAN,
    status: 'review',
    updatedAt: '2026-10-30T11:05:00',
  },
  {
    id: 'b4e0d8a2-9f3c-4e6a-b7d1-2c8a5f0e6d39',
    title: 'Шаблон описания показателей',
    category: 'Показатели',
    author: AUTHOR_STEPAN,
    status: 'returned',
    updatedAt: '2026-10-21T16:20:00',
  },
  {
    id: '0c6f2b7e-5a9d-4d3f-8b14-9e1c7a3f5d86',
    title: 'Ведение журнала обращений',
    category: 'Обучение',
    author: AUTHOR_STEPAN,
    status: 'archived',
    updatedAt: '2026-09-12T10:00:00',
  },
  {
    id: 'd9a5e1c4-7f2b-4a8e-9d6c-4b0f3e8a2c17',
    title: 'Порядок согласования правок',
    category: 'Процессы',
    author: AUTHOR_STEPAN,
    status: 'draft',
    updatedAt: '2026-11-03T08:30:00',
  },
];

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

/** Фильтрация на клиенте. Только для заглушки: с backend фильтры уходят в запрос */
function filterCards(cards: CardRow[], f: CardFilters): CardRow[] {
  const q = f.search.trim().toLowerCase();
  const { from, to } = f.updated;
  return cards.filter((c) => {
    const day = c.updatedAt.slice(0, 10);
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
      key: 'updated',
      fromLabel: 'Обновлено с',
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
            onClick={() => navigate('/cards/new')}
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
            onClick={() => navigate('/cards/new')}
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
    </PageLayout>
  );
}
