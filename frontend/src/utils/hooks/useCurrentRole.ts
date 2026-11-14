/** Не вошедший пользователь имеет роль guest. Авторизация подключится позже. */
import { useAuth } from '@/utils/hooks/useAuth';
import { ROLES, type Role } from '@/utils/types/roles';

export function useCurrentRole(): Role {
  const { user } = useAuth();

  return user?.role ?? ROLES.Guest;
}
