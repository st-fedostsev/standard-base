import {
  useCallback,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';

import { Alert, AlertTitle, Snackbar } from '@mui/material';

import styles from './Toast.module.css';
import type { ToastContextValue, ToastItem, ToastOptions } from './Toast.types';
import { ToastContext } from './ToastContext';

type ToastProviderProps = {
  children: ReactNode;
};

type ToastState = {
  current: ToastItem | null;
  queue: ToastItem[];
  open: boolean;
};

type ToastAction =
  | { type: 'enqueue'; toast: ToastItem }
  | { type: 'dismiss'; id: string }
  | { type: 'exited'; id: string };

const INITIAL_STATE: ToastState = {
  current: null,
  queue: [],
  open: false,
};

const DEFAULT_DURATION = 5000;

function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case 'enqueue': {
      if (state.current === null) {
        return {
          ...state,
          current: action.toast,
          open: true,
        };
      }

      return {
        ...state,
        queue: [...state.queue, action.toast],
      };
    }

    case 'dismiss': {
      if (state.current?.id === action.id) {
        return {
          ...state,
          open: false,
        };
      }

      return {
        ...state,
        queue: state.queue.filter((item) => item.id !== action.id),
      };
    }

    case 'exited': {
      if (state.current?.id !== action.id) {
        return state;
      }

      const [next, ...rest] = state.queue;

      return {
        current: next ?? null,
        queue: rest,
        open: next !== undefined,
      };
    }
  }
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [state, dispatch] = useReducer(toastReducer, INITIAL_STATE);
  const nextId = useRef(0);

  const showToast = useCallback((options: ToastOptions): string => {
    nextId.current += 1;

    const id = `toast-${nextId.current}`;

    dispatch({
      type: 'enqueue',
      toast: {
        ...options,
        id,
      },
    });

    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    dispatch({
      type: 'dismiss',
      id,
    });
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast,
      dismissToast,
    }),
    [showToast, dismissToast]
  );

  const current = state.current;
  const variant = current?.use ?? 'default';

  return (
    <ToastContext.Provider value={value}>
      {children}

      {current && (
        <Snackbar
          key={current.id}
          open={state.open}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          autoHideDuration={
            current.autoClose === false
              ? null
              : (current.duration ?? DEFAULT_DURATION)
          }
          onClose={(_event, reason) => {
            // Клик по странице не закрывает toast.
            if (reason === 'clickaway') return;

            dispatch({
              type: 'dismiss',
              id: current.id,
            });
          }}
          slotProps={{
            transition: {
              onExited: () => {
                dispatch({
                  type: 'exited',
                  id: current.id,
                });
              },
            },
          }}
        >
          <Alert
            className={styles.toast}
            /*
             * У MUI нет severity="default".
             * Используем info как основу и задаём нейтральный фон.
             */
            severity={variant === 'default' ? 'info' : variant}
            variant='filled'
            role={
              variant === 'error' || variant === 'warning' ? 'alert' : 'status'
            }
            sx={
              variant === 'default'
                ? {
                    bgcolor: '#424242',
                    color: '#fff',
                  }
                : undefined
            }
            onClose={() => {
              dispatch({
                type: 'dismiss',
                id: current.id,
              });
            }}
          >
            {current.title && <AlertTitle>{current.title}</AlertTitle>}

            {current.message}
          </Alert>
        </Snackbar>
      )}
    </ToastContext.Provider>
  );
}
