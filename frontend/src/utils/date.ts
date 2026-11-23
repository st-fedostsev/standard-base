const pad = (value: number) => String(value).padStart(2, '0');

/** Локальная дата в формате YYYY-MM-DD. */
export function toIsoDate(date: Date): string {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-');
}

/** Строго разбирает YYYY-MM-DD как локальную дату. */
export function fromIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const result = new Date(year, month - 1, day);

  // Проверяем, что JS не нормализовал несуществующую дату, например 31 февраля.
  if (
    result.getFullYear() !== year ||
    result.getMonth() !== month - 1 ||
    result.getDate() !== day
  ) {
    return null;
  }

  return result;
}

/** YYYY-MM-DD → ДД.ММ.ГГГГ. */
export function formatRuDate(value: string): string {
  const date = fromIsoDate(value);

  if (!date) return '';

  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

/** ДД.ММ.ГГГГ → YYYY-MM-DD. Возвращает null для неполной/неверной даты. */
export function parseRuDate(value: string): string | null {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value.trim());

  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return toIsoDate(date);
}

/** Нормализует дату к первому числу месяца. */
export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** Возвращает начало месяца с указанным смещением. */
export function shiftMonth(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

/** Сетка из 42 дат, неделя начинается с понедельника. */
export function getMonthGrid(month: Date): Date[] {
  const firstDay = startOfMonth(month);
  const mondayOffset = (firstDay.getDay() + 6) % 7;

  return Array.from(
    { length: 42 },
    (_, index) =>
      new Date(
        firstDay.getFullYear(),
        firstDay.getMonth(),
        1 - mondayOffset + index
      )
  );
}
