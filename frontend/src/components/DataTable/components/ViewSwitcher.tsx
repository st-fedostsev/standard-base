import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import GridViewOutlined from '@mui/icons-material/GridViewOutlined';
import TableRowsOutlined from '@mui/icons-material/TableRowsOutlined';

export type ViewMode = 'table' | 'cards';

type ViewSwitcherProps = {
  value: ViewMode;
  onChange: (value: ViewMode) => void;

  /** На узком экране табличный вид недоступен. */
  compact: boolean;
};

export function ViewSwitcher({ value, onChange, compact }: ViewSwitcherProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        flexWrap: 'wrap',
        gap: 1,
      }}
    >
      {compact && (
        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
          Карточный вид для узкого экрана
        </Typography>
      )}

      <ToggleButtonGroup
        exclusive
        size='small'
        value={value}
        aria-label='Вид отображения'
        onChange={(_, next: ViewMode | null) => {
          // Повторный клик по выбранной кнопке не снимает выбор.
          if (next !== null) {
            onChange(next);
          }
        }}
      >
        <ToggleButton
          value='table'
          disabled={compact}
          aria-label='Таблица'
          title={
            compact
              ? 'Таблица доступна при большей ширине'
              : 'Показать таблицей'
          }
        >
          <TableRowsOutlined fontSize='small' />
        </ToggleButton>

        <ToggleButton
          value='cards'
          aria-label='Карточки'
          title='Показать карточками'
        >
          <GridViewOutlined fontSize='small' />
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}
