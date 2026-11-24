/**
 * HTTP-статусы, которые используем в коде. Объект вместо enum: в tsconfig
 * включён erasableSyntaxOnly, а он запрещает enum.
 */
export const ResponseStatuses = {
  Conflict: 409,
  Forbidden: 403,
  NotFound: 404,
  Unauthorized: 401,
  UnprocessableEntity: 422,
} as const;

export type ResponseStatus =
  (typeof ResponseStatuses)[keyof typeof ResponseStatuses];

/**
 * Статусы, по которым понятно, что доступа нет: нет входа или прав
 * недостаточно.
 */
export const AccessErrors = [
  ResponseStatuses.Forbidden,
  ResponseStatuses.Unauthorized,
] as const;

export type AccessStatus = (typeof AccessErrors)[number];

export function isAccessStatus(status: number): status is AccessStatus {
  return (AccessErrors as readonly number[]).includes(status);
}

/** Имя файла без символов, запрещённых в именах большинства ОС. */
export function makeSafeFilename(name: string, extension: string): string {
  const clean = name.replace(/[\\/:*?"<>|]/g, '_').trim();

  return `${clean || 'card'}.${extension}`;
}

/** Скачивает Blob как файл, не оставляя ссылку в DOM. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
