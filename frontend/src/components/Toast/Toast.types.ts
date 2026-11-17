export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export type ToastOptions = {
  /** Основной текст уведомления. */
  message: string;

  /** Необязательный заголовок. */
  title?: string;

  /** Оформление уведомления. По умолчанию default. */
  use?: ToastVariant;

  /**
   * Закрывать автоматически. По умолчанию true. При false нужно закрыть
   * уведомление вручную.
   */
  autoClose?: boolean;

  /**
   * Время до автоматического закрытия в миллисекундах. По умолчанию 5000. Не
   * используется при autoClose: false.
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
