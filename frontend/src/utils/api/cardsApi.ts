import type {
  CardCategory,
  CardResponse,
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

  getList = async (
    payload: GetCardsRequest,
    signal?: AbortSignal
  ): Promise<CardResponse[]> => {
    const { data } = await this.http.post<CardResponse[]>(
      '/cards/get',
      payload,
      { signal }
    );

    return data;
  };

  getCategories = async (signal?: AbortSignal): Promise<CardCategory[]> => {
    const { data } = await this.http.get<CardCategory[]>('/cards/categories', {
      signal,
    });

    return data;
  };

  create = async (
    payload: CreateCardRequest,
    photo?: File | null
  ): Promise<CreateCardResponse> => {
    const formData = new FormData();

    formData.append('data', JSON.stringify(payload));

    if (photo) {
      formData.append('photo', photo, photo.name);
    }

    const { data } = await this.http.post<CreateCardResponse>(
      '/cards/create',
      formData
    );

    return data;
  };
}
