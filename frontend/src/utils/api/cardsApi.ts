import type {
  CreateCardRequest,
  CreateCardResponse,
  GetCardsRequest,
} from '@/utils/types/cards';
import type { AxiosInstance } from 'axios';

export class CardsApi {
  private readonly http: AxiosInstance;

  constructor(http: AxiosInstance) {
    this.http = http;
  }

  /**
   * Список карточек.
   *
   * Тип ответа пока неизвестен: в Swagger показан только пример { msg: "string"
   * }. Укажи тип при использовании, когда будет известен фактический контракт.
   */
  getList = async <TResponse = unknown>(
    payload: GetCardsRequest,
    signal?: AbortSignal
  ): Promise<TResponse> => {
    const { data } = await this.http.post<TResponse>('/cards/get', payload, {
      signal,
    });

    return data;
  };

  /**
   * Список категорий.
   *
   * Тип ответа нужно уточнить по фактическому JSON от бэкенда.
   */
  getCategories = async <TResponse = unknown>(
    signal?: AbortSignal
  ): Promise<TResponse> => {
    const { data } = await this.http.get<TResponse>('/cards/categories', {
      signal,
    });

    return data;
  };

  /**
   * Создание карточки через multipart/form-data. Не задаём Content-Type
   * вручную: браузер сам добавит boundary.
   */
  create = async (
    payload: CreateCardRequest,
    photo?: File | null
  ): Promise<CreateCardResponse> => {
    const formData = new FormData();

    if (photo) {
      formData.append('photo', photo);
    }

    formData.append('data', JSON.stringify(payload));

    const { data } = await this.http.post<CreateCardResponse>(
      '/cards/create',
      formData
    );

    return data;
  };
}
