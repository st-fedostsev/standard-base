import axios, { type AxiosInstance } from 'axios';

import { keysToCamelCase } from '@/utils/api/caseConversion';
import { ApiError } from '@/utils/api/errors';
import { isAccessStatus, type AccessStatus } from '@/utils/api/utils';
import { getAccessToken } from '@/utils/tokenStore';

/** Таймаут запроса по умолчанию — 60 секунд. */
export const DEFAULT_TIMEOUT_MS = 60_000;

/** Имя заголовка нужно подтвердить с бэкендером. */
const TRACE_ID_HEADER = 'x-trace-id';
const REFRESH_PATH = '/users/refresh';

type AccessListener = (status: AccessStatus) => void;

const accessListeners = new Set<AccessListener>();

/**
 * Подписка на ответы 401 и 403. Сам клиент не выполняет редирект и не очищает
 * сессию.
 */
export function onAccessError(listener: AccessListener): () => void {
  accessListeners.add(listener);

  return () => {
    accessListeners.delete(listener);
  };
}

/** Ошибка подписчика не должна заменять исходную ошибку API. */
function notifyAccessListeners(status: AccessStatus): void {
  accessListeners.forEach((listener) => {
    try {
      listener(status);
    } catch (error) {
      console.error('Ошибка обработчика доступа', error);
    }
  });
}

export function createHttpClient(): AxiosInstance {
  const http = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: DEFAULT_TIMEOUT_MS,
    withCredentials: true,
    headers: {
      Accept: 'application/json',
    },
  });

  http.interceptors.request.use((config) => {
    // Убираем query-строку и завершающий слеш для сравнения пути.
    const path = (config.url ?? '').split('?')[0].replace(/\/+$/, '');

    if (path === REFRESH_PATH) {
      config.headers.delete('Authorization');
      return config;
    }

    const token = getAccessToken();

    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    return config;
  });

  http.interceptors.response.use(
    (response) => {
      response.data = keysToCamelCase(response.data);
      return response;
    },

    (error: unknown) => {
      if (axios.isAxiosError(error) && error.response) {
        const { status, data, headers } = error.response;
        const traceId = headers[TRACE_ID_HEADER];

        if (isAccessStatus(status)) {
          notifyAccessListeners(status);
        }

        return Promise.reject(
          new ApiError(
            data,
            status,
            typeof traceId === 'string' ? traceId : undefined
          )
        );
      }

      // Сетевая ошибка, таймаут или отмена запроса.
      return Promise.reject(error);
    }
  );

  return http;
}
