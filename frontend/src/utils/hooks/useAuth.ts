import { createContext, useContext } from 'react';

import type { CurrentUser } from '@/utils/types/user';

export type AuthContextValue = {
  /** Access-токен текущей вкладки. */
  accessToken: string | null;

  /** Данные пользователя; null, если пользователь не вошёл. */
  user: CurrentUser | null;

  /** Данные пользователя загружаются. */
  isPending: boolean;

  /** Не удалось получить данные пользователя. */
  isError: boolean;

  /** Сохранить access-токен после входа или подтверждения регистрации. */
  startSession: (accessToken: string) => void;

  /** Повторно загрузить данные пользователя. */
  refreshUser: () => Promise<void>;

  /** Пока очищает только локальный токен и кэш. */
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
