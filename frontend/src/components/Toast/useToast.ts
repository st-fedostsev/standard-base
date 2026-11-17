import { useContext } from 'react';

import { ToastContext } from './ToastContext';

export function useToast() {
  const context = useContext(ToastContext);

  if (context === null) {
    throw new Error('useToast должен использоваться внутри ToastProvider');
  }

  return context;
}
