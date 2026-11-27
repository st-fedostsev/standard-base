import type {
  CardCategory,
  CardResponse,
  CardVisibility,
  CreateCardRequest,
  CreateCardResponse,
  GetCardsRequest,
} from '@/utils/types/cards';
import type { AxiosInstance } from 'axios';

import { downloadBlob, makeSafeFilename } from './utils';

type ImportCardPayload = {
  category_id: string;
  visibility: CardVisibility;
  file: File;
};

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

  /** Экспортирует карточку в PPTX и сразу скачивает файл. */
  downloadExport = async (
    card: Pick<CardResponse, 'id' | 'title'>
  ): Promise<void> => {
    const { data } = await this.http.post<Blob>(
      '/cards/export',
      { id: card.id },
      { responseType: 'blob' }
    );

    downloadBlob(data, makeSafeFilename(card.title, 'pptx'));
  };

  /** Импортирует карточку из презентации PPTX. */
  importCard = async (payload: ImportCardPayload): Promise<{ id: string }> => {
    const formData = new FormData();

    formData.append('file', payload.file, payload.file.name);

    const { data } = await this.http.post<{ id: string }>(
      '/cards/import',
      formData,
      {
        params: {
          category_id: payload.category_id,
          visibility: payload.visibility,
        },
      }
    );

    return data;
  };
}
