export const FILE_TYPES = {
  Svg: 'image/svg+xml',
  Png: 'image/png',
  Jpg: 'image/jpeg',
  Gif: 'image/gif',
} as const;

/** Union MIME-типов: "image/svg+xml" | "image/png" | "image/jpeg" | "image/gif" */
export type FileType = (typeof FILE_TYPES)[keyof typeof FILE_TYPES];

export const FILE_TYPE_LABELS: Record<FileType, string> = {
  [FILE_TYPES.Svg]: 'SVG',
  [FILE_TYPES.Png]: 'PNG',
  [FILE_TYPES.Jpg]: 'JPG',
  [FILE_TYPES.Gif]: 'GIF',
};

/** Все доступные форматы. */
export const ALL_FILE_TYPES: readonly FileType[] = Object.values(FILE_TYPES);

/** «SVG, PNG, JPG или GIF» */
export function formatFileTypes(types: readonly FileType[]): string {
  const labels = types.map((type) => FILE_TYPE_LABELS[type]);
  if (labels.length <= 1) return labels.join('');
  return `${labels.slice(0, -1).join(', ')} или ${labels[labels.length - 1]}`;
}
