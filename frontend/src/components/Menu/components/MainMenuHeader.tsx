import { Box, Typography } from '@mui/material';

import styles from '../Menu.module.css';

type MainMenuHeaderProps = {
  title?: string;
  showLabels: boolean;
};

export function MainMenuHeader({ title, showLabels }: MainMenuHeaderProps) {
  return (
    <Box className={styles.header}>
      <Box className={styles.logoColumn} aria-hidden='true'>
        <Box className={styles.logo}>Б</Box>
      </Box>

      {title && (
        <Typography
          variant='subtitle1'
          className={`${styles.title} ${showLabels ? styles.titleVisible : ''}`}
          sx={{
            maxWidth: '100%',
            fontFamily: 'Raleway, sans-serif',
            fontSize: 16,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: 0,
            color: '#000',
            textTransform: 'uppercase',
          }}
        >
          {title}
        </Typography>
      )}
    </Box>
  );
}
