import GridViewRounded from '@mui/icons-material/GridViewRounded';
import TableRowsRoundedIcon from '@mui/icons-material/TableRowsRounded';
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';

export type ViewMode = 'table' | 'cards';

type ViewSwitcherProps = {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
  compact?: boolean;
};

export function ViewSwitcher({
  value,
  onChange,
  compact = false,
}: ViewSwitcherProps) {
  const buttonSize = compact ? 40 : 44;

  return (
    <ToggleButtonGroup
      exclusive
      value={value}
      onChange={(_event, nextValue: ViewMode | null) => {
        // Не даём снять выбор повторным нажатием на активный режим.
        if (nextValue !== null) {
          onChange(nextValue);
        }
      }}
      aria-label='Режим отображения материалов'
      sx={{
        height: buttonSize,
        overflow: 'hidden',
        border: '1px solid #C7D0D5',
        borderRadius: '8px',
        bgcolor: '#F7FAFA',

        '& .MuiToggleButtonGroup-grouped': {
          width: buttonSize,
          height: buttonSize,
          p: 0,
          border: 0,
          borderRadius: 0,
          color: '#50585A',

          '&:not(:first-of-type)': {
            borderLeft: '1px solid #C7D0D5',
          },

          '&:hover': {
            bgcolor: 'rgba(25, 118, 210, 0.06)',
          },

          '&.Mui-selected, &.Mui-selected:hover': {
            color: '#263238',
            bgcolor: '#D6E8F5',
          },

          '&.Mui-focusVisible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: -2,
          },
        },

        '& .MuiSvgIcon-root': {
          fontSize: compact ? 21 : 24,
        },
      }}
    >
      <Tooltip title='Таблица'>
        <ToggleButton value='table' aria-label='Таблица'>
          <TableRowsRoundedIcon />
        </ToggleButton>
      </Tooltip>

      <Tooltip title='Карточки'>
        <ToggleButton value='cards' aria-label='Карточки'>
          <GridViewRounded />
        </ToggleButton>
      </Tooltip>
    </ToggleButtonGroup>
  );
}
