export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export type ToastOptions = {
  /** Основной текст уведомления. */
  message: string;

  /** Необязательный заголовок. */
  title?: string;

  /** Оформление уведомления. По умолчанию default. */
  use?: ToastVariant;

  /**
   * Время до автоматического закрытия в миллисекундах. По умолчанию 3000.
   * Кнопки закрытия у тоста нет, поэтому он всегда скрывается сам.
   */
  duration?: number;
};

export type ToastItem = ToastOptions & {
  id: string;
};

export type ToastContextValue = {
  /** Показать уведомление и получить его ID. */
  showToast: (options: ToastOptions) => string;

  /** Закрыть уведомление или удалить его из очереди по ID. */
  dismissToast: (id: string) => void;
};
