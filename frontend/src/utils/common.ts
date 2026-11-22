/**
 * Форма слова по числу: 1 файл, 2 файла, 5 файлов.
 *
 * @param count Количество.
 * @param forms Формы для 1, 2–4 и 5+ (например, `['файл', 'файла', 'файлов']`).
 */
export function plural(count: number, forms: [string, string, string]): string {
  const abs = Math.abs(count) % 100;
  const last = abs % 10;

  if (abs > 10 && abs < 20) return forms[2];
  if (last === 1) return forms[0];
  if (last >= 2 && last <= 4) return forms[1];
  return forms[2];
}
