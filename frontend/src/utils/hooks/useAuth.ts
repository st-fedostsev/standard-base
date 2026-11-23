import { createContext, useContext } from 'react';

import type { CurrentUser } from '@/utils/types/user';

export type AuthContextValue = {
  accessToken: string | null;
  user: CurrentUser | null;

  /** Идёт восстановление сессии или первая загрузка /users/me. */
  isPending: boolean;

  /** Ошибка восстановления сессии или загрузки /users/me. */
  isError: boolean;

  /** Сохранить access-токен после входа или подтверждения регистрации. */
  startSession: (accessToken: string) => void;

  /** Повторно загрузить пользователя. */
  refreshUser: () => Promise<void>;

  /** Повторить восстановление сессии после ошибки. */
  retryAuth: () => Promise<void>;

  /** Очистить локальную сессию и кэш. */
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }

  return context;
}
