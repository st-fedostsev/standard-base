import type { ReactNode } from 'react';

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  type DialogProps,
} from '@mui/material';

type ModalLayoutProps = {
  open: boolean;
  onClose: () => void;
  /** Заголовок. Может содержать дополнительные элементы, например переключатель. */
  title: ReactNode;
  /** Кнопки в нижней части диалога. */
  actions: ReactNode;
  children: ReactNode;
  maxWidth?: DialogProps['maxWidth'];
  fullWidth?: boolean;
  titleId?: string;
};

/** Общий каркас модального окна: заголовок, содержимое и область действий. */
export function ModalLayout({
  open,
  onClose,
  title,
  actions,
  children,
  maxWidth,
  fullWidth = true,
  titleId,
}: ModalLayoutProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      aria-labelledby={titleId}
    >
      <DialogTitle
        id={titleId}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'nowrap',
          gap: 2,
        }}
      >
        {title}
      </DialogTitle>

      <DialogContent>{children}</DialogContent>

      <DialogActions>{actions}</DialogActions>
    </Dialog>
  );
}
