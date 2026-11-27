import { useState, type FormEvent } from 'react';

import { FileUpload } from '@/components/Modals/FileUpload';
import { ModalLayout } from '@/components/Modals/ModalLayout';
import { Toggle, type ToggleOption } from '@/components/Modals/Toggle';
import { useToast } from '@/components/Toast/useToast';
import { api } from '@/utils/api';
import type { CardCategory, CardVisibility } from '@/utils/types/cards';
import {
  Alert,
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';

type ImportCardModalProps = {
  open: boolean;
  categories: CardCategory[];
  onClose: () => void;
  onImported: () => void;
};

const VISIBILITY_OPTIONS: ToggleOption<CardVisibility>[] = [
  { value: 'public', label: 'ПУБЛИЧНАЯ' },
  { value: 'protected', label: 'ЗАЩИЩЁННАЯ' },
  { value: 'private', label: 'ПРИВАТНАЯ' },
];

/** Импорт карточки из PPTX: файл, категория и видимость. */
export function ImportCardModal({
  open,
  categories,
  onClose,
  onImported,
}: ImportCardModalProps) {
  const { showToast } = useToast();

  const [categoryId, setCategoryId] = useState('');
  const [visibility, setVisibility] = useState<CardVisibility>('public');
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setCategoryId('');
    setVisibility('public');
    setFiles([]);
    setError(null);
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    reset();
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const file = files[0];

    if (!file) {
      setError('Выберите презентацию PPTX');
      return;
    }

    if (!categoryId) {
      setError('Выберите категорию');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await api.Cards.importCard({ category_id: categoryId, visibility, file });
      showToast({ message: 'Карточка импортирована', use: 'success' });
      reset();
      onImported();
      onClose();
    } catch {
      setError('Не удалось импортировать презентацию. Проверьте файл.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalLayout
      open={open}
      onClose={handleClose}
      maxWidth='sm'
      titleId='import-card-title'
      title={
        <Typography
          component='span'
          variant='h6'
          sx={{ display: 'block', fontWeight: 700 }}
        >
          Импорт карточки
        </Typography>
      }
      actions={
        <>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Отмена
          </Button>
          <Button
            type='submit'
            form='import-card-form'
            variant='contained'
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Импорт…' : 'Импортировать'}
          </Button>
        </>
      }
    >
      <form
        id='import-card-form'
        onSubmit={(event) => void handleSubmit(event)}
      >
        <TextField
          fullWidth
          size='small'
          select
          label='Категория'
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
        >
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </TextField>

        <Box sx={{ mt: 2 }}>
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ display: 'block' }}
          >
            Видимость
          </Typography>
          <Toggle
            value={visibility}
            options={VISIBILITY_OPTIONS}
            onChange={setVisibility}
            ariaLabel='Видимость карточки'
            disabled={isSubmitting}
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ display: 'block' }}
          >
            Презентация *
          </Typography>
          <FileUpload
            value={files}
            onChange={setFiles}
            label='Загрузите презентацию'
            hint='PPTX (макс. 3 МБ)'
            accept='.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation'
            maxFiles={1}
            disabled={isSubmitting}
          />
        </Box>

        {error && (
          <Alert sx={{ mt: 2 }} severity='error'>
            {error}
          </Alert>
        )}
      </form>
    </ModalLayout>
  );
}
