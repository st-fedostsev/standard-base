import { Box, CircularProgress, Typography } from '@mui/material';

type LoaderProps = {
  /** Текст рядом со спиннером. */
  label?: string;

  /** Размер индикатора в пикселях. */
  size?: number;
};

export function Loader({ label = 'Загрузка...', size = 24 }: LoaderProps) {
  return (
    <Box
      role='status'
      aria-live='polite'
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        p: 3,
      }}
    >
      <CircularProgress size={size} aria-hidden='true' />

      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
    </Box>
  );
}
