import { useState } from 'react';

import { ModalLayout } from '@/components/Modals/ModalLayout';
import type { CardResult, CardRow } from '@/utils/types/cards';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import ArrowDropDown from '@mui/icons-material/ArrowDropDown';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ImageOutlined from '@mui/icons-material/ImageOutlined';
import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';

type CardPreviewModalProps = {
  open: boolean;
  card: CardRow | null;
  onClose: () => void;
  onExport: (card: CardRow) => Promise<void>;
};

function getPercent(result: CardResult): string {
  if (result.before === 0) {
    return '—';
  }

  const value = Math.round((result.after / result.before - 1) * 100);

  return value > 0 ? `+${value}%` : `${value}%`;
}

function ResultRow({ result }: { result: CardResult }) {
  const isUp = result.after >= result.before;
  const color = result.isPositive ? 'success.main' : 'error.main';
  const Arrow = isUp ? ArrowUpward : ArrowDownward;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr) auto',
        alignItems: 'center',
        gap: 1,
        py: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{ display: 'block' }}
        >
          Было
        </Typography>
        <Typography variant='body2' sx={{ fontWeight: 600 }}>
          {result.before}
        </Typography>
      </Box>

      <Arrow sx={{ color, fontSize: 20 }} />

      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{ display: 'block' }}
        >
          Стало
        </Typography>
        <Typography variant='body2' sx={{ fontWeight: 600 }}>
          {result.after}
        </Typography>
      </Box>

      <Typography variant='body2' sx={{ color, fontWeight: 700 }}>
        {getPercent(result)}
      </Typography>
    </Box>
  );
}

/** Окно предпросмотра карточки: обложка и показатели слева, поля справа. */
export function CardPreviewModal({
  open,
  card,
  onClose,
  onExport,
}: CardPreviewModalProps) {
  const [exportMenuAnchor, setExportMenuAnchor] = useState<HTMLElement | null>(
    null
  );
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setExportMenuAnchor(null);

    if (card === null || isExporting) {
      return;
    }

    setIsExporting(true);
    try {
      await onExport(card);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ModalLayout
      open={open}
      onClose={onClose}
      maxWidth='lg'
      titleId='card-preview-title'
      title={
        <Typography
          component='span'
          variant='h6'
          sx={{ display: 'block', fontWeight: 700, textTransform: 'uppercase' }}
        >
          {card?.title ?? 'Карточка'}
        </Typography>
      }
      actions={
        <>
          <Button onClick={onClose} disabled={isExporting}>
            Отмена
          </Button>

          <ButtonGroup variant='contained' disabled={isExporting}>
            <Button onClick={() => void handleExport()}>
              {isExporting ? 'Экспорт…' : 'Экспорт'}
            </Button>
            <Button
              aria-label='Форматы экспорта'
              onClick={(event) => setExportMenuAnchor(event.currentTarget)}
            >
              <ArrowDropDown />
            </Button>
          </ButtonGroup>

          <Menu
            anchorEl={exportMenuAnchor}
            open={exportMenuAnchor !== null}
            onClose={() => setExportMenuAnchor(null)}
          >
            <MenuItem onClick={() => void handleExport()}>
              Слайд PowerPoint (.pptx)
            </MenuItem>
          </Menu>
        </>
      }
    >
      {card === null ? null : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: '1fr 1fr' },
            gap: 3,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            {card.photo ? (
              <Box
                component='img'
                src={`data:image/jpeg;base64,${card.photo}`}
                alt={card.title}
                sx={{
                  width: '100%',
                  aspectRatio: '4 / 3',
                  objectFit: 'cover',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              />
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  width: '100%',
                  aspectRatio: '4 / 3',
                  borderRadius: 1,
                  border: '1px dashed',
                  borderColor: 'divider',
                  color: 'text.secondary',
                }}
              >
                <ImageOutlined sx={{ fontSize: 40 }} />
                <Typography variant='body2'>
                  Изображение не загружено
                </Typography>
              </Box>
            )}

            <Box sx={{ mt: 2 }}>
              {card.results.map((result, index) => (
                <ResultRow key={`${result.title}-${index}`} result={result} />
              ))}
            </Box>
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <TextField
              fullWidth
              size='small'
              label='Отрасль'
              value={card.industry}
              slotProps={{ htmlInput: { readOnly: true } }}
            />

            <TextField
              fullWidth
              size='small'
              label='Пилотный поток'
              value={card.pilotStream}
              slotProps={{ htmlInput: { readOnly: true } }}
              sx={{ mt: 2 }}
            />

            <Divider sx={{ my: 2 }} />

            <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
              Мероприятия
            </Typography>

            <Box
              sx={{
                maxHeight: 260,
                overflowY: 'auto',
                pr: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              {card.activities.map((activity, index) => (
                <TextField
                  key={`${activity}-${index}`}
                  fullWidth
                  size='small'
                  multiline
                  minRows={2}
                  label={`Мероприятие ${index + 1}`}
                  value={activity}
                  slotProps={{ htmlInput: { readOnly: true } }}
                />
              ))}

              {card.activities.length === 0 && (
                <Typography variant='body2' color='text.secondary'>
                  Мероприятия не указаны
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      )}
    </ModalLayout>
  );
}
