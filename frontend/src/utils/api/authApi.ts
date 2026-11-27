import type { AxiosInstance } from 'axios';

import type {
  CheckCodeRequest,
  CheckCodeResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '@/utils/types/auth';
import type { CurrentUser } from '@/utils/types/user';

type CurrentUserResponse = CurrentUser & {
  avatar?: string | null;
  email?: string;
};

/** Бэк отдаёт base64 в поле avatar, интерфейс ждёт готовый URL аватара. */
function normalizeCurrentUser(data: CurrentUserResponse): CurrentUser {
  const { avatar, ...rest } = data;

  return {
    ...rest,
    avatarUrl: avatar ? `data:image/jpeg;base64,${avatar}` : null,
  };
}

export class AuthApi {
  private readonly http: AxiosInstance;

  constructor(http: AxiosInstance) {
    this.http = http;
  }

  /** Регистрирует пользователя и возвращает идентификатор OTP-кода. */
  register = async (payload: RegisterRequest): Promise<RegisterResponse> => {
    const { data } = await this.http.post<RegisterResponse>(
      '/users/register',
      payload
    );

    return data;
  };

  /** Проверяет OTP-код и возвращает access-токен. */
  checkCode = async (payload: CheckCodeRequest): Promise<CheckCodeResponse> => {
    const { data } = await this.http.post<CheckCodeResponse>(
      '/users/check_code',
      payload
    );

    return data;
  };

  /** Отправляет данные для входа и получает идентификатор OTP-кода. */
  login = async (payload: LoginRequest): Promise<LoginResponse> => {
    const { data } = await this.http.post<LoginResponse>(
      '/users/login',
      payload
    );

    return data;
  };

  /** Получает пользователя по access-токену. */
  getCurrentUser = async (signal?: AbortSignal): Promise<CurrentUser> => {
    const { data } = await this.http.get<CurrentUserResponse>('/users/me', {
      signal,
    });

    return normalizeCurrentUser(data);
  };

  /** Получает новый access-токен через refresh-cookie. */
  refreshAccessToken = async (signal?: AbortSignal): Promise<string> => {
    // Ответ сервера access_token преобразуется перехватчиком в accessToken.
    const { data } = await this.http.post<{ accessToken?: unknown }>(
      '/users/refresh',
      undefined,
      { signal }
    );

    if (typeof data?.accessToken !== 'string' || !data.accessToken) {
      throw new Error('Сервер не вернул access-токен');
    }

    return data.accessToken;
  };
}
