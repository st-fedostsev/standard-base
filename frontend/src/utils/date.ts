const pad = (n: number) => String(n).padStart(2, '0');

/** Дата YYYY-MM-DD по локальному времени */
export function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** YYYY-MM-DD в Date. Пусто или некорректно: null */
export function fromIsoDate(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** YYYY-MM-DD в дд.мм.гггг. Пусто: пустая строка */
export function formatRu(iso: string): string {
  const d = fromIsoDate(iso);
  return d
    ? `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`
    : '';
}

/** дд.мм.гггг в YYYY-MM-DD. Неполная или несуществующая дата (например, 31.02): null */
export function parseRu(text: string): string | null {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(text.trim());
  if (!m) return null;
  const iso = `${m[3]}-${m[2]}-${m[1]}`;
  const d = fromIsoDate(iso);
  if (!d || d.getDate() !== Number(m[1]) || d.getMonth() + 1 !== Number(m[2]))
    return null;
  return iso;
}

export const todayIso = () => toIsoDate(new Date());

export const startOfMonth = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), 1);

export const addMonths = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth() + n, 1);

/** 42 дня (6 недель) для сетки календаря. Неделя начинается с понедельника */
export function buildMonthGrid(view: Date): Date[] {
  const first = startOfMonth(view);
  // В getDay() воскресенье = 0, переводим так, чтобы понедельник был первым
  const offset = (first.getDay() + 6) % 7;
  return Array.from(
    { length: 42 },
    (_, i) => new Date(first.getFullYear(), first.getMonth(), 1 - offset + i)
  );
}
