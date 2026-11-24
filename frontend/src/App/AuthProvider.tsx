import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { api } from '@/utils/api';
import { ApiError } from '@/utils/api/errors';
import { ResponseStatuses } from '@/utils/api/utils';
import { AuthContext, type AuthContextValue } from '@/utils/hooks/useAuth';
import { setAccessTokenReader } from '@/utils/tokenStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

type AuthProviderProps = {
  children: ReactNode;
};

type AuthPhase = 'restoring' | 'guest' | 'authenticated' | 'error';

type Session = {
  phase: AuthPhase;
  accessToken: string | null;
  revision: number;
};

/** Не даём StrictMode отправлять параллельные refresh-запросы. */
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

function hasStatus(error: unknown, status: number): boolean {
  if (error instanceof ApiError && Number(error.status) === status) {
    return true;
  }

  return isAxiosError(error) && error.response?.status === status;
}

function isUnauthorized(error: unknown): boolean {
  return hasStatus(error, Number(ResponseStatuses.Unauthorized));
}

function isForbidden(error: unknown): boolean {
  return hasStatus(error, 403);
}

function isAuthRejected(error: unknown): boolean {
  return isUnauthorized(error) || isForbidden(error);
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();

  const tokenRef = useRef<string | null>(null);
  const authRevisionRef = useRef(0);
  const meUnauthorizedRecoveryRef = useRef(false);

  const [session, setSession] = useState<Session>({
    phase: 'restoring',
    accessToken: null,
    revision: 0,
  });

  // Axios читает access-токен из памяти провайдера.
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
      if (isAuthRejected(error)) {
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

      meUnauthorizedRecoveryRef.current = false;
      tokenRef.current = accessToken;

      setSession({
        phase: 'authenticated',
        accessToken,
        revision,
      });
    } catch {
      if (authRevisionRef.current !== revision) {
        return;
      }

      meUnauthorizedRecoveryRef.current = false;
      tokenRef.current = null;

      // Неудачный refresh не блокирует публичные страницы.
      // Если backend недоступен, сам запрос логина всё равно не выполнится.
      setSession({
        phase: 'guest',
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

      meUnauthorizedRecoveryRef.current = false;
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

    meUnauthorizedRecoveryRef.current = false;
    tokenRef.current = null;

    setSession({
      phase: 'guest',
      accessToken: null,
      revision,
    });

    await queryClient.cancelQueries();
    queryClient.clear();

    // Refresh-cookie должен удалять или отзывать backend,
    // когда появится logout endpoint.
  }, [queryClient]);

  useEffect(() => {
    if (
      session.phase !== 'authenticated' ||
      session.accessToken === null ||
      authRevisionRef.current !== session.revision ||
      tokenRef.current !== session.accessToken
    ) {
      return;
    }

    if (currentUserQuery.isSuccess) {
      meUnauthorizedRecoveryRef.current = false;
      return;
    }

    // 403 от /users/me: считаем текущую сессию непригодной
    // и показываем приложение как гостю.
    if (isForbidden(currentUserQuery.error)) {
      meUnauthorizedRecoveryRef.current = false;
      void logout();
      return;
    }

    if (!isUnauthorized(currentUserQuery.error)) {
      return;
    }

    // При 401 один раз пробуем получить новый access-токен.
    if (!meUnauthorizedRecoveryRef.current) {
      meUnauthorizedRecoveryRef.current = true;
      void restoreSession();
      return;
    }

    // Повторный /me снова вернул 401 — завершаем сессию.
    meUnauthorizedRecoveryRef.current = false;
    void logout();
  }, [
    currentUserQuery.error,
    currentUserQuery.isSuccess,
    logout,
    restoreSession,
    session.accessToken,
    session.phase,
    session.revision,
  ]);

  const refreshUser = useCallback(async () => {
    if (session.phase !== 'authenticated') {
      return;
    }

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
        (session.phase === 'authenticated' &&
          currentUserQuery.isPending &&
          !isAuthRejected(currentUserQuery.error)),

      isError:
        session.phase === 'error' ||
        (session.phase === 'authenticated' &&
          currentUserQuery.isError &&
          !isAuthRejected(currentUserQuery.error)),

      startSession,
      refreshUser,
      retryAuth,
      logout,
    }),
    [
      currentUserQuery.data,
      currentUserQuery.error,
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
