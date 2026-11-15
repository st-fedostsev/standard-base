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
          variant='subtitle2'
          className={`${styles.title} ${showLabels ? styles.titleVisible : ''}`}
        >
          {title}
        </Typography>
      )}
    </Box>
  );
}
