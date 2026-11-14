type AccessTokenReader = () => string | null;

let readAccessToken: AccessTokenReader = () => null;

/** Подключает функцию чтения токена из AuthProvider. */
export function setAccessTokenReader(reader: AccessTokenReader): void {
  readAccessToken = reader;
}

/** Возвращает текущий access-токен для axios. */
export function getAccessToken(): string | null {
  return readAccessToken();
}
