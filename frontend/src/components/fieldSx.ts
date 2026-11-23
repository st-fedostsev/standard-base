import type { Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';

export const fieldSx: SystemStyleObject<Theme> = {
  '& .MuiOutlinedInput-root': {
    bgcolor: '#fff',

    '&:hover, &.Mui-focused': {
      bgcolor: '#fff',
    },
  },
};
