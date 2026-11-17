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
  revision: number;
};

/** Не даём React StrictMode отправить два refresh-запроса при первом запуске. */
let refreshPromise: Promise<string> | null = null;

function restoreAccessToken(): Promise<string> {
  if (refreshPromise !== null) {
    return refreshPromise;
  }

  const request = api.Auth.refreshAccessToken();
  refreshPromise = request;

  const clearPromise = () => {
    if (refreshPromise === request) {
      refreshPromise = null;
    }
  };

  void request.then(clearPromise, clearPromise);

  return request;
}

function isUnauthorized(error: unknown): boolean {
  return (
    error instanceof ApiError && error.status === ResponseStatuses.Unauthorized
  );
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const tokenRef = useRef<string | null>(null);
  const authRevisionRef = useRef(0);

  const [session, setSession] = useState<Session>({
    phase: 'restoring',
    accessToken: null,
    revision: 0,
  });

  // Axios получает актуальный access-токен из памяти провайдера.
  useLayoutEffect(() => {
    setAccessTokenReader(() => tokenRef.current);

    return () => {
      setAccessTokenReader(() => null);
    };
  }, []);

  const currentUserQuery = useQuery({
    queryKey: ['auth', 'me', session.revision],
    queryFn: ({ signal }) => api.Auth.getCurrentUser(signal),
    enabled: session.phase === 'authenticated' && session.accessToken !== null,

    retry: (failureCount, error) => {
      if (isUnauthorized(error)) {
        return false;
      }

      return failureCount < 1;
    },

    refetchOnWindowFocus: 'always',
  });

  const restoreSession = useCallback(async () => {
    const revision = ++authRevisionRef.current;

    tokenRef.current = null;
    setSession({
      phase: 'restoring',
      accessToken: null,
      revision,
    });

    try {
      const accessToken = await restoreAccessToken();

      if (authRevisionRef.current !== revision) {
        return;
      }

      tokenRef.current = accessToken;

      setSession({
        phase: 'authenticated',
        accessToken,
        revision,
      });
    } catch (error) {
      if (authRevisionRef.current !== revision) {
        return;
      }

      tokenRef.current = null;

      if (isUnauthorized(error)) {
        // Нет действующей refresh-cookie: продолжаем как гость.
        setSession({
          phase: 'guest',
          accessToken: null,
          revision,
        });
        return;
      }

      // Сеть или сервер недоступны — это ошибка, а не гостевая сессия.
      setSession({
        phase: 'error',
        accessToken: null,
        revision,
      });
    }
  }, []);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  const startSession = useCallback(
    (accessToken: string) => {
      const revision = ++authRevisionRef.current;

      tokenRef.current = accessToken;
      queryClient.clear();

      setSession({
        phase: 'authenticated',
        accessToken,
        revision,
      });
    },
    [queryClient]
  );

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

    // Пока нет logout-эндпоинта, это очищает только состояние фронтенда.
    // Refresh-cookie должен удалять или отзывать сервер.
  }, [queryClient]);

  // Если /users/me вернул 401, access-токен очищается.
  useEffect(() => {
    if (
      session.phase === 'authenticated' &&
      session.accessToken !== null &&
      authRevisionRef.current === session.revision &&
      tokenRef.current === session.accessToken &&
      isUnauthorized(currentUserQuery.error)
    ) {
      void logout();
    }
  }, [
    currentUserQuery.error,
    logout,
    session.accessToken,
    session.phase,
    session.revision,
  ]);

  const refreshUser = useCallback(async () => {
    if (session.phase !== 'authenticated') return;

    await queryClient.invalidateQueries({
      queryKey: ['auth', 'me', session.revision],
      exact: true,
    });
  }, [queryClient, session.phase, session.revision]);

  const retryAuth = useCallback(async () => {
    if (session.accessToken !== null) {
      await refreshUser();
      return;
    }

    await restoreSession();
  }, [refreshUser, restoreSession, session.accessToken]);

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
      retryAuth,
      logout,
    }),
    [
      currentUserQuery.data,
      currentUserQuery.isError,
      currentUserQuery.isPending,
      logout,
      refreshUser,
      retryAuth,
      session.accessToken,
      session.phase,
      startSession,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
