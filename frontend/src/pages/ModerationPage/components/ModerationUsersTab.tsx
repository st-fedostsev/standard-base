import { useMemo, useState } from 'react';

import { DataTable, SORT_LABELS, type Column } from '@/components/DataTable';
import {
  createEmptySelection,
  isRowSelected,
  type TableSelection,
} from '@/components/DataTable/selection';
import { EmptyState } from '@/components/EmptyState';
import { MassActionsPanel } from '@/components/MassActionsPanel';
import { useToast } from '@/components/Toast';
import { TruncatedText } from '@/components/TruncatedText';
import type { ModerationAction, PendingUser } from '@/utils/types/moderation';
import { ROLE_LABELS } from '@/utils/types/roles';
import CancelOutlined from '@mui/icons-material/CancelOutlined';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import PersonAddAltOutlined from '@mui/icons-material/PersonAddAltOutlined';
import { Avatar, Chip, Stack, Typography } from '@mui/material';

function getUserName(user: PendingUser): string {
  return [user.firstName, user.lastName, user.patronymic]
    .filter(Boolean)
    .join(' ');
}

function getUserInitials(user: PendingUser): string {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
}

const USER_COLUMNS: Column<PendingUser>[] = [
  {
    key: 'user',
    title: 'Пользователь',
    sortValue: getUserName,
    sortLabels: SORT_LABELS.text,
    render: (user) => (
      <Stack
        direction='row'
        spacing={1.5}
        sx={{ alignItems: 'center', minWidth: 0 }}
      >
        <Avatar
          src={user.avatarUrl ?? undefined}
          alt=''
          sx={{
            width: 32,
            height: 32,
            bgcolor: '#E0E0E0',
            color: '#616161',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {getUserInitials(user)}
        </Avatar>

        <TruncatedText value={getUserName(user)} alwaysShowTooltip />
      </Stack>
    ),
  },
  {
    key: 'email',
    title: 'Email',
    sortValue: (user) => user.email,
    sortLabels: SORT_LABELS.text,
    render: (user) => <TruncatedText value={user.email} alwaysShowTooltip />,
  },
  {
    key: 'role',
    title: 'Роль',
    width: 200,
    sortValue: (user) => ROLE_LABELS[user.role],
    sortLabels: SORT_LABELS.text,
    render: (user) => <Chip size='small' label={ROLE_LABELS[user.role]} />,
  },
];

type ModerationUsersTabProps = {
  users: PendingUser[];
  onRemove: (ids: string[]) => void;
};

export function ModerationUsersTab({
  users,
  onRemove,
}: ModerationUsersTabProps) {
  const { showToast } = useToast();
  const [selection, setSelection] =
    useState<TableSelection>(createEmptySelection);

  const selectedIds = useMemo(
    () =>
      users
        .filter((user) => isRowSelected(selection, user.id))
        .map((user) => user.id),
    [selection, users]
  );

  const moderate = (ids: string[], action: ModerationAction) => {
    if (ids.length === 0) {
      return;
    }

    const names = users
      .filter((user) => ids.includes(user.id))
      .map(getUserName);
    const isSingle = names.length === 1;
    const message =
      action === 'approve'
        ? isSingle
          ? `Пользователь ${names[0]} принят`
          : `Принято пользователей: ${names.length}`
        : isSingle
          ? `Заявка ${names[0]} отклонена`
          : `Отклонено заявок: ${names.length}`;

    onRemove(ids);
    setSelection(createEmptySelection());
    showToast({
      message,
      use: action === 'approve' ? 'success' : 'warning',
    });
  };

  return (
    <DataTable<PendingUser>
      toolbarStart={
        <Typography variant='subtitle1' sx={{ fontWeight: 600, fontSize: 18 }}>
          Ожидают согласования: {users.length}
        </Typography>
      }
      columns={USER_COLUMNS}
      rows={users}
      getRowId={(user) => user.id}
      totalMatchingCount={users.length}
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
              id: 'approve-users',
              label: 'Принять',
              icon: CheckCircleOutlined,
              onClick: () => moderate(selectedIds, 'approve'),
            },
            {
              id: 'reject-users',
              label: 'Отклонить',
              icon: CancelOutlined,
              danger: true,
              onClick: () => moderate(selectedIds, 'reject'),
            },
          ]}
        />
      )}
      kebabMenu={(user) => [
        {
          id: 'approve-user',
          label: 'Принять',
          icon: CheckCircleOutlined,
          onClick: () => moderate([user.id], 'approve'),
        },
        {
          id: 'reject-user',
          label: 'Отклонить',
          icon: CancelOutlined,
          danger: true,
          onClick: () => moderate([user.id], 'reject'),
        },
      ]}
      empty={
        <EmptyState
          icon={PersonAddAltOutlined}
          title='Заявок нет'
          description='Новые пользователи появятся здесь после регистрации.'
        />
      }
    />
  );
}
