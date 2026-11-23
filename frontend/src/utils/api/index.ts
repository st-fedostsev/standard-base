import { CardsApi } from '@/utils/api/cardsApi';
import { AuthApi } from '@/utils/api/authApi';
import { createHttpClient } from '@/utils/api/client';
import type { AxiosInstance } from 'axios';

import { NotificationsApi } from './notificationsApi';

export { ApiError, type ErrorBody } from '@/utils/api/errors';
export { DEFAULT_TIMEOUT_MS, onAccessError } from '@/utils/api/client';
export {
  AccessErrors,
  isAccessStatus,
  ResponseStatuses,
  type AccessStatus,
  type ResponseStatus,
} from '@/utils/api/utils';

/**
 * Реестр всех API приложения. Новый раздел: класс в utils/api/<name>.ts, поле
 * здесь и строка в конструкторе. Параметр http нужен для тестов: можно передать
 * клиент-заглушку.
 */
export default class Api {
  public readonly Auth: AuthApi;
  public readonly Notifications: NotificationsApi;
  public readonly Cards: CardsApi;

  constructor(http: AxiosInstance = createHttpClient()) {
    this.Auth = new AuthApi(http);
    this.Notifications = new NotificationsApi(http);
    this.Cards = new CardsApi(http);
  }
}

/** Общий экземпляр для приложения: import { api } from "@/utils/api" */
export const api = new Api();
