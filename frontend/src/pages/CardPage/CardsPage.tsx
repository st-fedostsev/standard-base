import { useMemo, useState } from 'react';

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
import { CardPreviewModal } from '@/components/Modals/CardPreviewModal';
import { ImportCardModal } from '@/components/Modals/ImportCardModal';
import { PermissionGuard } from '@/components/PermissionGuard';
import { useToast } from '@/components/Toast/useToast';
import { api } from '@/utils/api';
import { useCurrentRole } from '@/utils/hooks/useCurrentRole';
import {
  DEFAULT_CARD_FILTERS,
  type CardFilters,
  type CardRow,
  type CreateCardRequest,
} from '@/utils/types/cards';
import { isFiltered } from '@/utils/types/filters';
import { ROLES, hasAccess } from '@/utils/types/roles';
import AddIcon from '@mui/icons-material/Add';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import FileUploadOutlined from '@mui/icons-material/FileUploadOutlined';
import SearchOffOutlined from '@mui/icons-material/SearchOffOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import { Button, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';

import { CARD_COLUMNS } from './utils/cardColumns';
import { createCardFilterDefs } from './utils/cardFilterDefs';
import { filterCards } from './utils/filterCards';
import { useCardsPageData } from './utils/useCardsPageData';

export function CardsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const role = useCurrentRole();
  const canSelect = hasAccess(role, [ROLES.Author, ROLES.Admin]);

  const [filters, setFilters] = useState<CardFilters>(DEFAULT_CARD_FILTERS);
  const [selection, setSelection] =
    useState<TableSelection>(createEmptySelection);
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [previewCard, setPreviewCard] = useState<CardRow | null>(null);

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

  type CardRowData = (typeof rows)[number];

  const changeFilters = (next: CardFilters) => {
    setFilters(next);
    setSelection(createEmptySelection());
  };

  const onSubmit = async (
    payload: CreateCardRequest,
    photo: File | null
  ): Promise<void> => {
    await api.Cards.create(payload, photo);
    await queryClient.invalidateQueries({ queryKey: ['cards'] });
    setSelection(createEmptySelection());
  };

  const exportCard = async (card: CardRow): Promise<void> => {
    try {
      await api.Cards.downloadExport(card);
      showToast({ message: 'Экспорт карточки начат', use: 'success' });
    } catch {
      showToast({
        message: 'Не удалось экспортировать карточку',
        use: 'error',
      });
    }
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
                onClick={() => setImportOpen(true)}
                sx={{
                  px: 2,
                  py: '6px',
                  minHeight: 36,
                  fontSize: 14,
                  fontWeight: 700,
                  lineHeight: '24px',
                  letterSpacing: '0.4px',
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
                  fontWeight: 700,
                  lineHeight: '24px',
                  letterSpacing: '0.4px',
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
          <DataTable<CardRowData>
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
            totalMatchingCount={rows.length}
            selection={selection}
            onSelectionChange={setSelection}
            massActionsPanel={
              canSelect
                ? ({ count, selectAll, clear }) => (
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
                          roles: [ROLES.Author, ROLES.Admin],
                          // Массовый экспорт появится вместе с отдельным эндпоинтом.
                          onClick: () => undefined,
                        },
                      ]}
                    />
                  )
                : undefined
            }
            kebabMenu={(card) => [
              {
                id: 'preview-card',
                label: 'Предпросмотр',
                icon: VisibilityOutlined,
                onClick: () => setPreviewCard(card),
              },
              {
                id: 'export-card',
                label: 'Экспортировать карточку',
                icon: FileDownloadOutlined,
                roles: [ROLES.Author, ROLES.Admin],
                onClick: () => {
                  void exportCard(card);
                },
              },
            ]}
          />
        </InfiniteScrollable>
      </PageLayout>

      <AddCardModal
        open={addCardOpen}
        onClose={() => setAddCardOpen(false)}
        categories={categories}
        onSubmit={onSubmit}
      />

      <ImportCardModal
        open={importOpen}
        categories={categories}
        onClose={() => setImportOpen(false)}
        onImported={() => {
          void queryClient.invalidateQueries({ queryKey: ['cards'] });
          setSelection(createEmptySelection());
        }}
      />

      <CardPreviewModal
        open={previewCard !== null}
        card={previewCard}
        onClose={() => setPreviewCard(null)}
        onExport={exportCard}
      />
    </>
  );
}
