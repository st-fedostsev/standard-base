import { useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';

import { PageLayout } from '@/App/PageLayout';
import { PageHeaderTabs } from '@/components/PageHeaderTabs';
import { useAuth } from '@/utils/hooks/useAuth';
import type { CardRow } from '@/utils/types/cards';
import type { PendingUser } from '@/utils/types/moderation';
import { ROLES } from '@/utils/types/roles';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import PeopleOutlined from '@mui/icons-material/PeopleOutlined';

import { ModerationCardsTab } from './components/ModerationCardsTab';
import { ModerationUsersTab } from './components/ModerationUsersTab';
import { MOCK_PENDING_CARDS, MOCK_PENDING_USERS } from './mockData';

type ModerationTab = 'cards' | 'users';

export function ModerationPage() {
  const { user, isPending } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<PendingUser[]>(MOCK_PENDING_USERS);
  const [cards, setCards] = useState<CardRow[]>(MOCK_PENDING_CARDS);

  if (isPending) {
    return (
      <PageLayout title='Согласование' isLoading>
        {null}
      </PageLayout>
    );
  }

  if (user?.role !== ROLES.Admin) {
    return <Navigate to='/base' replace />;
  }

  const tab: ModerationTab =
    searchParams.get('tab') === 'cards' ? 'cards' : 'users';

  const changeTab = (next: string) => {
    setSearchParams(next === 'users' ? {} : { tab: next }, { replace: true });
  };

  const removeUsers = (ids: string[]) => {
    setUsers((current) => current.filter((user) => !ids.includes(user.id)));
  };

  const removeCards = (ids: string[]) => {
    setCards((current) => current.filter((card) => !ids.includes(card.id)));
  };

  return (
    <PageLayout
      title='Согласование'
      headerTabs={
        <PageHeaderTabs
          value={tab}
          onChange={changeTab}
          ariaLabel='Разделы согласования'
          tabs={[
            {
              value: 'cards',
              label: 'Карточки',
              icon: <DescriptionOutlined />,
            },
            {
              value: 'users',
              label: 'Пользователи',
              icon: <PeopleOutlined />,
            },
          ]}
        />
      }
    >
      {tab === 'cards' ? (
        <ModerationCardsTab cards={cards} onRemove={removeCards} />
      ) : (
        <ModerationUsersTab users={users} onRemove={removeUsers} />
      )}
    </PageLayout>
  );
}
