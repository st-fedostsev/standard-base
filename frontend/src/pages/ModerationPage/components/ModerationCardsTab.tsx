import { useMemo, useState } from 'react';

import { DataTable } from '@/components/DataTable';
import {
  createEmptySelection,
  isRowSelected,
  type TableSelection,
} from '@/components/DataTable/selection';
import { EmptyState } from '@/components/EmptyState';
import { MassActionsPanel } from '@/components/MassActionsPanel';
import { CardPreviewModal } from '@/components/Modals/CardPreviewModal';
import { useToast } from '@/components/Toast';
import { CARD_COLUMNS } from '@/pages/CardPage/utils/cardColumns';
import type { CardRow } from '@/utils/types/cards';
import type { ModerationAction } from '@/utils/types/moderation';
import CancelOutlined from '@mui/icons-material/CancelOutlined';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import TaskAltOutlined from '@mui/icons-material/TaskAltOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import { Typography } from '@mui/material';

const MODERATION_CARD_COLUMNS = CARD_COLUMNS.filter(
  (column) => column.key !== 'status'
);

type ModerationCardsTabProps = {
  cards: CardRow[];
  onRemove: (ids: string[]) => void;
};

export function ModerationCardsTab({
  cards,
  onRemove,
}: ModerationCardsTabProps) {
  const { showToast } = useToast();
  const [selection, setSelection] =
    useState<TableSelection>(createEmptySelection);
  const [previewCard, setPreviewCard] = useState<CardRow | null>(null);

  const selectedIds = useMemo(
    () =>
      cards
        .filter((card) => isRowSelected(selection, card.id))
        .map((card) => card.id),
    [cards, selection]
  );

  const moderate = (ids: string[], action: ModerationAction) => {
    if (ids.length === 0) {
      return;
    }

    const titles = cards
      .filter((card) => ids.includes(card.id))
      .map((card) => card.title);
    const isSingle = titles.length === 1;
    const message =
      action === 'approve'
        ? isSingle
          ? `Карточка «${titles[0]}» опубликована`
          : `Опубликовано карточек: ${titles.length}`
        : isSingle
          ? `Карточка «${titles[0]}» возвращена на доработку`
          : `Возвращено карточек: ${titles.length}`;

    onRemove(ids);
    setSelection(createEmptySelection());
    showToast({
      message,
      use: action === 'approve' ? 'success' : 'warning',
    });
  };

  return (
    <>
      <DataTable<CardRow>
        toolbarStart={
          <Typography
            variant='subtitle1'
            sx={{ fontWeight: 600, fontSize: 18 }}
          >
            На согласовании: {cards.length}
          </Typography>
        }
        columns={MODERATION_CARD_COLUMNS}
        rows={cards}
        getRowId={(card) => card.id}
        totalMatchingCount={cards.length}
        showViewSwitcher={false}
        selection={selection}
        onSelectionChange={setSelection}
        massActionsPanel={({ count, selectAll, clear }) => (
          <MassActionsPanel
            count={count}
            onClear={clear}
            onSelectAll={selectAll}
            actions={[
              {
                id: 'approve-cards',
                label: 'Принять',
                icon: CheckCircleOutlined,
                onClick: () => moderate(selectedIds, 'approve'),
              },
              {
                id: 'reject-cards',
                label: 'Отклонить',
                icon: CancelOutlined,
                danger: true,
                onClick: () => moderate(selectedIds, 'reject'),
              },
            ]}
          />
        )}
        kebabMenu={(card) => [
          {
            id: 'preview-card',
            label: 'Предпросмотр',
            icon: VisibilityOutlined,
            onClick: () => setPreviewCard(card),
          },
          {
            id: 'approve-card',
            label: 'Принять',
            icon: CheckCircleOutlined,
            onClick: () => moderate([card.id], 'approve'),
          },
          {
            id: 'reject-card',
            label: 'Отклонить',
            icon: CancelOutlined,
            danger: true,
            onClick: () => moderate([card.id], 'reject'),
          },
        ]}
        empty={
          <EmptyState
            icon={TaskAltOutlined}
            title='Карточек нет'
            description='Новые карточки появятся здесь после отправки на модерацию.'
          />
        }
      />

      <CardPreviewModal
        open={previewCard !== null}
        card={previewCard}
        onClose={() => setPreviewCard(null)}
        onExport={async () => {
          showToast({
            message: 'Экспорт пока недоступен в демо-режиме',
            use: 'warning',
          });
        }}
      />
    </>
  );
}
