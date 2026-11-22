import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PageLayout } from '@/App/PageLayout';
import { DataTable } from '@/components/DataTable';
import {
  createEmptySelection,
  type TableSelection,
} from '@/components/DataTable/selection';
import { EmptyState } from '@/components/EmptyState';
import { FilterBar } from '@/components/FilterBar';
import { InfiniteScrollable } from '@/components/InfiniteScrollable/InfiniteScrollable';
import { MassActionsPanel } from '@/components/MassActionsPanel';
import { AddCardModal } from '@/components/Modals/AddCardModal';
import { PermissionGuard } from '@/components/PermissionGuard';
import { DEFAULT_CARD_FILTERS, type CardFilters } from '@/utils/types/cards';
import { isFiltered } from '@/utils/types/filters';
import { ROLES } from '@/utils/types/roles';
import AddIcon from '@mui/icons-material/Add';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import FileUploadOutlined from '@mui/icons-material/FileUploadOutlined';
import SearchOffOutlined from '@mui/icons-material/SearchOffOutlined';
import { Button, Typography } from '@mui/material';

import { CARD_COLUMNS } from './utils/cardColumns';
import { createCardFilterDefs } from './utils/cardFilterDefs';
import { filterCards } from './utils/filterCards';
import { useCardsPageData } from './utils/useCardsPageData';

export function CardsPage() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<CardFilters>(DEFAULT_CARD_FILTERS);
  const [selection, setSelection] =
    useState<TableSelection>(createEmptySelection);
  const [addCardOpen, setAddCardOpen] = useState(false);

  const {
    cards,
    categories,
    authors,
    totalCount,
    hasNextPage,
    isInitialLoading,
    isInitialError,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
    refetch,
  } = useCardsPageData(filters);

  const rows = useMemo(
    () => filterCards(cards, filters, categories),
    [cards, filters, categories]
  );

  type CardRow = (typeof rows)[number];

  const changeFilters = (next: CardFilters) => {
    setFilters(next);
    setSelection(createEmptySelection());
  };

  const hasFilters = isFiltered(filters, DEFAULT_CARD_FILTERS);

  const filterDefs = useMemo(
    () => createCardFilterDefs(categories, authors),
    [categories, authors]
  );

  const countLabel = hasFilters
    ? `Найдено: ${rows.length}`
    : `Материалов: ${totalCount}`;

  const isPageEmpty =
    !isInitialLoading && !isInitialError && !hasNextPage && rows.length === 0;

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
      title='Таблица пуста'
      description='Создайте или импортируйте первую карточку.'
      action={
        <PermissionGuard allowed={[ROLES.Author, ROLES.Admin]}>
          <Button
            variant='outlined'
            startIcon={<AddIcon />}
            onClick={() => setAddCardOpen(true)}
          >
            Создать
          </Button>
        </PermissionGuard>
      }
    />
  );

  const retryNextPage = () => fetchNextPage().then(() => undefined);

  return (
    <>
      <PageLayout
        title='Стандарты и практики'
        isLoading={isInitialLoading}
        isError={isInitialError}
        errorTitle='Не удалось загрузить карточки'
        errorDescription='Проверьте соединение и попробуйте снова.'
        onRetry={() => void refetch()}
        isRetrying={isInitialLoading}
        isEmpty={isPageEmpty}
        emptyState={emptyState}
        actions={
          <PermissionGuard allowed={[ROLES.Author, ROLES.Admin]}>
            <>
              <Button
                variant='contained'
                startIcon={<FileUploadOutlined />}
                //TODO импортируем файл onClick={}
                sx={{
                  px: 2,
                  py: '6px',
                  minHeight: 36,
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: '24px',
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase',
                }}
              >
                Импортировать
              </Button>

              <Button
                variant='contained'
                startIcon={<AddIcon />}
                onClick={() => setAddCardOpen(true)}
                sx={{
                  px: 2,
                  py: '6px',
                  minHeight: 36,
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: '24px',
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase',
                }}
              >
                Создать
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
        <InfiniteScrollable
          hasMore={hasNextPage}
          isLoadingMore={isFetchingNextPage}
          onLoadMore={() => fetchNextPage().then(() => undefined)}
          loadMoreError={isFetchNextPageError}
          onRetry={retryNextPage}
        >
          <DataTable<CardRow>
            toolbarStart={
              !isInitialLoading ? (
                <Typography
                  variant='subtitle1'
                  sx={{ fontWeight: 600, fontSize: 18 }}
                >
                  {countLabel}
                </Typography>
              ) : null
            }
            columns={CARD_COLUMNS}
            rows={rows}
            getRowId={(card) => card.id}
            totalMatchingCount={totalCount}
            selection={selection}
            onSelectionChange={setSelection}
            onRowClick={(card) => navigate(`/cards/${card.id}`)}
            massActionsPanel={({ count, selectAll, clear }) => (
              <MassActionsPanel
                count={count}
                onClear={clear}
                onSelectAll={selectAll}
                actions={[
                  {
                    id: 'export-selected',
                    label: 'Экспортировать выбранное',
                    icon: FileDownloadOutlined,
                    disabled: true,
                    onClick: () => {
                      // TODO: подключить экспорт выбранных карточек.
                    },
                  },
                ]}
              />
            )}
            kebabMenu={(card) => [
              {
                id: 'open',
                label: 'Открыть',
                icon: DescriptionOutlined,
                onClick: () => navigate(`/cards/${card.id}`),
              },
              {
                id: 'export-card',
                label: 'Экспортировать карточку',
                icon: FileDownloadOutlined,
                disabled: true,
                onClick: () => {
                  // TODO: подключить экспорт карточки.
                },
              },
            ]}
          />
        </InfiniteScrollable>
      </PageLayout>
      <AddCardModal
        open={addCardOpen}
        onClose={() => setAddCardOpen(false)}
        // Пока форма только проверяется: сохранение карточки не подключено.
        onSubmit={() => setAddCardOpen(false)}
      />
    </>
  );
}
