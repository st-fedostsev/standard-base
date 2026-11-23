import type { AxiosInstance } from 'axios';

import type {
  GetNotificationsRequest,
  GetNotificationsResponse,
  ReadNotificationRequest,
} from '@/utils/types/notifications';

export class NotificationsApi {
  private readonly http: AxiosInstance;

  constructor(http: AxiosInstance) {
    this.http = http;
  }

  /** Получить страницу уведомлений текущего пользователя. */
  getList = async (
    payload: GetNotificationsRequest,
    signal?: AbortSignal
  ): Promise<GetNotificationsResponse> => {
    const { data } = await this.http.post<GetNotificationsResponse>(
      '/users/notifications',
      payload,
      { signal }
    );

    return data;
  };

  /** Отметить уведомление прочитанным. */
  markRead = async (id: string): Promise<void> => {
    const payload: ReadNotificationRequest = { id };

    await this.http.post('/users/read_notification', payload);
  };
}
