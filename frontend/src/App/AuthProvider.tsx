import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/utils/api';
import { ApiError } from '@/utils/api/errors';
import { ResponseStatuses } from '@/utils/api/utils';
import { AuthContext, type AuthContextValue } from '@/utils/hooks/useAuth';
import { setAccessTokenReader } from '@/utils/tokenStore';

type AuthProviderProps = {
  children: ReactNode;
};

type AuthPhase = 'restoring' | 'guest' | 'authenticated' | 'error';

type Session = {
  phase: AuthPhase;
  accessToken: string | null;

  /** Разделяет данные разных сессий в кэше. Сам токен в ключ не попадает. */
  revision: number;
};

/**
 * Один запрос восстановления на вкладку.
 *
 * В React StrictMode эффекты могут запускаться повторно. Пока запрос
 * выполняется, повторный вызов использует тот же Promise.
 */
let restorePromise: Promise<string> | null = null;

function restoreAccessToken(): Promise<string> {
  if (restorePromise) {
    return restorePromise;
  }

  const request = api.Auth.refreshAccessToken();
  restorePromise = request;

  // Освобождаем Promise после завершения, не скрывая исходную ошибку.
  void request.then(
    () => {
      if (restorePromise === request) {
        restorePromise = null;
      }
    },
    () => {
      if (restorePromise === request) {
        restorePromise = null;
      }
    }
  );

  return request;
}

function isUnauthorized(error: unknown): boolean {
  return (
    error instanceof ApiError && error.status === ResponseStatuses.Unauthorized
  );
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();

  const [session, setSession] = useState<Session>({
    phase: 'restoring',
    accessToken: null,
    revision: 0,
  });

  // Axios получает актуальный токен через функцию из tokenStore.
  const tokenRef = useRef<string | null>(null);

  // Позволяет не применять устаревший результат восстановления,
  // если пользователь уже вошёл или вышел.
  const authRevisionRef = useRef(0);

  useLayoutEffect(() => {
    setAccessTokenReader(() => tokenRef.current);

    return () => {
      setAccessTokenReader(() => null);
    };
  }, []);

  const currentUserQuery = useQuery({
    queryKey: ['auth', 'me', session.revision],
    queryFn: ({ signal }) => api.Auth.getCurrentUser(signal),

    // /me вызывается только после получения access-токена.
    enabled: session.phase === 'authenticated' && session.accessToken !== null,

    retry: (failureCount, error) => {
      if (isUnauthorized(error)) {
        return false;
      }

      return failureCount < 1;
    },

    refetchOnWindowFocus: 'always',
  });

  /**
   * Вызывается после входа или подтверждения регистрации. Сохраняет
   * access-токен и запускает запрос /users/me.
   */
  const startSession = useCallback(
    (accessToken: string) => {
      const revision = ++authRevisionRef.current;

      tokenRef.current = accessToken;

      // Очищаем данные предыдущей сессии.
      queryClient.clear();

      setSession({
        phase: 'authenticated',
        accessToken,
        revision,
      });
    },
    [queryClient]
  );

  /**
   * Пока это локальный выход: очищает access-токен и кэш. HttpOnly cookie
   * должен удалить или отозвать бэкенд.
   */
  const logout = useCallback(async () => {
    const revision = ++authRevisionRef.current;

    tokenRef.current = null;

    setSession({
      phase: 'guest',
      accessToken: null,
      revision,
    });

    await queryClient.cancelQueries();
    queryClient.clear();
  }, [queryClient]);

  /**
   * При открытии или обновлении вкладки пытаемся восстановить сессию через
   * refresh-cookie.
   */
  useEffect(() => {
    let active = true;
    const revision = authRevisionRef.current;

    const restoreSession = async () => {
      try {
        const accessToken = await restoreAccessToken();

        if (!active || authRevisionRef.current !== revision) {
          return;
        }

        const newRevision = ++authRevisionRef.current;
        tokenRef.current = accessToken;

        setSession({
          phase: 'authenticated',
          accessToken,
          revision: newRevision,
        });
      } catch (error) {
        if (!active || authRevisionRef.current !== revision) {
          return;
        }

        tokenRef.current = null;

        if (isUnauthorized(error)) {
          // Нет действующей refresh-сессии — пользователь гость.
          setSession({
            phase: 'guest',
            accessToken: null,
            revision,
          });
          return;
        }

        // Ошибка сети, сервера или неожиданный ответ refresh.
        setSession({
          phase: 'error',
          accessToken: null,
          revision,
        });
      }
    };

    void restoreSession();

    return () => {
      // Не отменяем сам запрос: при повторном запуске эффекта в StrictMode
      // следующий вызов сможет использовать тот же Promise.
      active = false;
    };
  }, []);

  /**
   * Временное поведение до автоматического обновления access-токена: если
   * именно /users/me вернул 401, очищаем локальную сессию.
   */
  useEffect(() => {
    if (
      session.phase !== 'authenticated' ||
      session.accessToken === null ||
      authRevisionRef.current !== session.revision ||
      tokenRef.current !== session.accessToken ||
      !isUnauthorized(currentUserQuery.error)
    ) {
      return;
    }

    void logout();
  }, [
    currentUserQuery.error,
    logout,
    session.accessToken,
    session.phase,
    session.revision,
  ]);

  /** Повторно загружает данные пользователя. Это не refresh токена. */
  const refreshUser = useCallback(async () => {
    if (session.phase !== 'authenticated') return;

    await queryClient.invalidateQueries({
      queryKey: ['auth', 'me', session.revision],
      exact: true,
    });
  }, [queryClient, session.phase, session.revision]);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken: session.accessToken,

      user:
        session.phase === 'authenticated' && !currentUserQuery.isError
          ? (currentUserQuery.data ?? null)
          : null,

      isPending:
        session.phase === 'restoring' ||
        (session.phase === 'authenticated' && currentUserQuery.isPending),

      isError:
        session.phase === 'error' ||
        (session.phase === 'authenticated' && currentUserQuery.isError),

      startSession,
      refreshUser,
      logout,
    }),
    [
      currentUserQuery.data,
      currentUserQuery.isError,
      currentUserQuery.isPending,
      logout,
      refreshUser,
      session.accessToken,
      session.phase,
      startSession,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
