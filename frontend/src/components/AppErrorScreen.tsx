import ErrorOutlineOutlined from '@mui/icons-material/ErrorOutlineOutlined';
import { Box, Button, Typography } from '@mui/material';

type AppErrorScreenProps = {
  message?: string;
  onRetry: () => void;
  retrying?: boolean;
};

export function AppErrorScreen({
  message = 'Проверьте соединение и попробуйте снова.',
  onRetry,
  retrying = false,
}: AppErrorScreenProps) {
  return (
    <Box
      role='alert'
      sx={{
        position: 'fixed',
        width: '100%',
        height: '100%',
        inset: 0,
        zIndex: (theme) => theme.zIndex.modal + 10,
        boxSizing: 'border-box',
        display: 'grid',
        placeItems: 'center',
        p: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.25,
          width: 'min(420px, 100%)',
          boxSizing: 'border-box',
          p: 1.5,
          borderRadius: 1,
          bgcolor: 'rgba(211, 47, 47, 0.08)',
          color: 'text.primary',
        }}
      >
        <ErrorOutlineOutlined
          aria-hidden='true'
          sx={{
            flexShrink: 0,
            mt: 0.125,
            color: 'error.main',
          }}
        />

        <Typography
          variant='body2'
          sx={{
            flex: 1,
            minWidth: 0,
            overflowWrap: 'anywhere',
          }}
        >
          {message}
        </Typography>

        <Button
          size='small'
          color='inherit'
          disabled={retrying}
          onClick={onRetry}
          sx={{
            flexShrink: 0,
            whiteSpace: 'nowrap',
            textTransform: 'none',
          }}
        >
          {retrying ? 'Повтор…' : 'Повторить'}
        </Button>
      </Box>
    </Box>
  );
}
