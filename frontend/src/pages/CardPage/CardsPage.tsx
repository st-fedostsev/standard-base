import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PageLayout } from '@/App/PageLayout';
import {
  CellLines,
  DataTable,
  SORT_LABELS,
  type Column,
} from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { FilterBar } from '@/components/FilterBar';
import { MassActionsPanel } from '@/components/MassActionsPanel';
import { PermissionGuard } from '@/components/PermissionGuard';
import { api } from '@/utils/api';
import {
  CARD_STATUS_LABELS,
  CARD_STATUS_OPTIONS,
  DEFAULT_CARD_FILTERS,
  type CardAuthor,
  type CardCategory,
  type CardFilters,
  type CardRow,
  type GetCardsRequest,
} from '@/utils/types/cards';
import { isFiltered, type FilterDef } from '@/utils/types/filters';
import { ROLES } from '@/utils/types/roles';
import AddIcon from '@mui/icons-material/Add';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import SearchOffOutlined from '@mui/icons-material/SearchOffOutlined';
import SendOutlined from '@mui/icons-material/SendOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import { Button, Chip, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';

/**
 * Запрашиваемая страница API. Подстрой limit, если у backend есть меньший
 * максимум.
 */
const PAGE_LIMIT = 100;

const NO_CARDS: CardRow[] = [];

type CardsResponse =
  | CardRow[]
  | {
      result?: number;
      data: CardRow[];
    };

type NormalizedCardsResponse = {
  rows: CardRow[];
  totalCount?: number;
};

/**
 * Поддерживает два распространённых формата:
 *
 * 1. Массив карточек;
 * 2. Объект { result, data }.
 *
 * Если ответ backend имеет другую структуру, адаптируй эту функцию.
 */
function normalizeCardsResponse(
  response: CardsResponse
): NormalizedCardsResponse {
  if (Array.isArray(response)) {
    return {
      rows: response,
      totalCount: response.length,
    };
  }

  if (response && Array.isArray(response.data)) {
    return {
      rows: response.data,
      totalCount:
        typeof response.result === 'number'
          ? response.result
          : response.data.length,
    };
  }

  throw new Error('Неожиданный формат ответа /cards/get');
}

const authorName = (author: CardAuthor) =>
  `${author.lastName} ${author.firstName}`;

const columns: Column<CardRow>[] = [
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
    render: (card) => <Typography variant='body2'>{card.category}</Typography>,
  },
  {
    key: 'author',
    title: 'Автор',
    width: 260,
    sortValue: (card) => authorName(card.author),
    sortLabels: SORT_LABELS.text,
    render: (card) => (
      <CellLines
        primary={authorName(card.author)}
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
        variant='outlined'
        label={CARD_STATUS_LABELS[card.status]}
      />
    ),
  },
];

const canSendToReview = (card: CardRow) =>
  card.status === 'draft' || card.status === 'returned';

/**
 * Фильтрация клиентом поверх загруженного ответа. API получает даты и поиск;
 * выбранные статусы и категории применяются локально, потому что его контракт
 * принимает для них одиночные строки.
 */
function filterCards(cards: CardRow[], filters: CardFilters): CardRow[] {
  const query = filters.search.trim().toLocaleLowerCase('ru');
  const { from, to } = filters.created;

  return cards.filter((card) => {
    const createdDay = card.createAt.slice(0, 10);

    return (
      (query === '' || card.title.toLocaleLowerCase('ru').includes(query)) &&
      (filters.status.length === 0 || filters.status.includes(card.status)) &&
      (filters.category.length === 0 ||
        filters.category.includes(card.category)) &&
      (filters.authorIds.length === 0 ||
        filters.authorIds.includes(card.author.id)) &&
      (from === '' || createdDay >= from) &&
      (to === '' || createdDay <= to)
    );
  });
}

export function CardsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<CardFilters>(DEFAULT_CARD_FILTERS);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const request: GetCardsRequest = {
    created_from: filters.created.from || null,
    created_to: filters.created.to || null,
    title: filters.search.trim() || null,
    status: filters.status.length === 1 ? filters.status[0] : null,
    category: filters.category.length === 1 ? filters.category[0] : null,
    limit: PAGE_LIMIT,
    offset: 0,
  };

  const categoriesQuery = useQuery<CardCategory[]>({
    queryKey: ['card-categories'],
    queryFn: ({ signal }) => api.Cards.getCategories<CardCategory[]>(signal),
    meta: { globalLoader: true },
  });

  const categories = categoriesQuery.data ?? [];

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  const cardsQuery = useQuery({
    queryKey: ['cards', request],
    queryFn: async () => {
      const response = await api.Cards.getList<CardsResponse>(request);

      return normalizeCardsResponse(response);
    },
    meta: { globalLoader: true },
  });

  const cards = cardsQuery.data?.rows ?? NO_CARDS;
  const totalCount = cardsQuery.data?.totalCount ?? cards.length;

  const rows = useMemo(() => filterCards(cards, filters), [cards, filters]);

  const authors = useMemo(() => {
    const byId = new Map<string, CardAuthor>();

    cards.forEach((card) => {
      byId.set(card.author.id, card.author);
    });

    return [...byId.values()].sort((a, b) =>
      authorName(a).localeCompare(authorName(b), 'ru')
    );
  }, [cards]);

  const selectedRows = useMemo(
    () => cards.filter((card) => selected.has(card.id)),
    [cards, selected]
  );

  const allSendable =
    selectedRows.length > 0 && selectedRows.every(canSendToReview);

  const changeFilters = (next: CardFilters) => {
    setFilters(next);
    setSelected(new Set());
  };

  const hasFilters = isFiltered(filters, DEFAULT_CARD_FILTERS);

  const sendToReview = (ids: string[]) => {
    // TODO: подключить mutation соответствующего endpoint.
    setSelected(
      (previous) => new Set([...previous].filter((id) => !ids.includes(id)))
    );
  };

  // TODO: убрать фильтры в компоненты
  const filterDefs: FilterDef[] = [
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
      options: categoryOptions,
      width: 200,
    },
    {
      type: 'multiselect',
      key: 'authorIds',
      label: 'Автор',
      options: authors.map((author) => ({
        value: author.id,
        label: authorName(author),
      })),
      searchable: true,
      roles: [ROLES.Admin],
      width: 220,
    },
  ];

  const countLabel = hasFilters
    ? `Найдено: ${rows.length}`
    : `Материалов: ${totalCount}`;

  const emptyState = hasFilters ? (
    <EmptyState
      icon={SearchOffOutlined}
      description='По выбранным условиям карточек нет. Измените фильтры или сбросьте их.'
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
      description='Карточек пока нет.'
      action={
        <PermissionGuard allowed={[ROLES.Author, ROLES.Admin]}>
          <Button
            variant='outlined'
            startIcon={<AddIcon />}
            onClick={() => navigate('/cards/new')}
          >
            Создать карточку
          </Button>
        </PermissionGuard>
      }
    />
  );

  return (
    <PageLayout
      title='Реестр решений'
      actions={
        <PermissionGuard allowed={[ROLES.Author, ROLES.Admin]}>
          <>
            <Button
              variant='outlined'
              startIcon={<FileUploadOutlinedIcon />}
              disabled
            >
              Экспортировать
            </Button>

            <Button
              variant='outlined'
              startIcon={<FileDownloadOutlinedIcon />}
              disabled
            >
              Импортировать
            </Button>

            <Button
              variant='contained'
              startIcon={<AddIcon />}
              onClick={() => navigate('/cards/new')}
            >
              Создать карточку
            </Button>
          </>
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
        toolbarStart={
          !cardsQuery.isPending && !cardsQuery.isError ? (
            <Typography variant='body2' sx={{ fontWeight: 600, fontSize: 24 }}>
              {countLabel}
            </Typography>
          ) : null
        }
        columns={columns}
        rows={rows}
        getRowId={(card) => card.id}
        selectedIds={selected}
        onSelectedIdsChange={setSelected}
        onRowClick={(card) => navigate(`/cards/${card.id}`)}
        massActionsPanel={({ count, selectAll, clear }) => (
          <MassActionsPanel
            count={count}
            onClear={clear}
            onSelectAll={selectAll}
            actions={[
              {
                id: 'send',
                label: 'Отправить на согласование',
                icon: SendOutlined,
                disabled: !allSendable,
                onClick: () => sendToReview([...selected]),
              },
            ]}
          />
        )}
        kebabMenu={(card) => [
          {
            id: 'open',
            label: 'Открыть',
            icon: VisibilityOutlined,
            onClick: () => navigate(`/cards/${card.id}`),
          },
          {
            id: 'send',
            label: 'Отправить на согласование',
            icon: SendOutlined,
            roles: [ROLES.Author, ROLES.Admin],
            disabled: !canSendToReview(card),
            onClick: () => sendToReview([card.id]),
          },
        ]}
        isLoading={cardsQuery.isPending}
        errorText={
          cardsQuery.isError
            ? 'Не удалось загрузить карточки. Попробуйте позже.'
            : undefined
        }
        empty={emptyState}
      />
    </PageLayout>
  );
}
