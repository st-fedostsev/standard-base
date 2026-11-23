import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react';

import { Box, IconButton, Typography } from '@mui/material';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import InsertDriveFileOutlined from '@mui/icons-material/InsertDriveFileOutlined';
import UploadFileIcon from '@mui/icons-material/UploadFile';

import { ValidationContainer } from '@/components/containers/ValidationContainer';

import { plural } from '@/utils/common';
import { formatFileTypes, type FileType } from '@/utils/types/fileTypes';

type FileUploadProps = {
  value: File[];
  onChange: (files: File[]) => void;
  allowedTypes: readonly FileType[];
  maxSizeMb: number;
  maxFiles: number;
  label?: string;
  errorText?: string;
  disabled?: boolean;
};

/** Загрузки файлов. */
export function FileUpload({
  value,
  onChange,
  allowedTypes,
  maxSizeMb,
  maxFiles,
  label = 'Загрузите фотографию',
  errorText,
  disabled = false,
}: FileUploadProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [innerError, setInnerError] = useState<string>();

  const previews = useMemo(
    () => value.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [value]
  );

  useEffect(
    () => () => previews.forEach((preview) => URL.revokeObjectURL(preview.url)),
    [previews]
  );

  const isFull = value.length >= maxFiles;
  const maxFilesError =
    maxFiles === 1
      ? 'Можно загрузить только один файл'
      : `Можно загрузить максимум ${maxFiles} ${plural(maxFiles, ['файл', 'файла', 'файлов'])}`;

  const typesLabel = formatFileTypes(allowedTypes);
  const hint = `${typesLabel} (макс. ${maxSizeMb} МБ)`;

  const isAllowedType = (file: File) =>
    allowedTypes.some((type) => type === file.type);

  const addFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const incoming = Array.from(fileList);

    if (isFull || value.length + incoming.length > maxFiles) {
      setInnerError(maxFilesError);
      return;
    }
    if (incoming.some((file) => !isAllowedType(file))) {
      setInnerError(`Допустимые форматы: ${typesLabel}`);
      return;
    }
    if (incoming.some((file) => file.size > maxSizeMb * 1024 * 1024)) {
      setInnerError(`Файл больше ${maxSizeMb} МБ`);
      return;
    }

    setInnerError(undefined);
    onChange([...value, ...incoming]);
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(event.target.files);
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    addFiles(event.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setInnerError(undefined);
    onChange(value.filter((_, i) => i !== index));
  };

  const message = errorText ?? innerError;

  return (
    <ValidationContainer errorText={message} errorId={errorId}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5 }}>
        <Typography variant='caption' color='text.secondary'>
          {value.length}/{maxFiles}
        </Typography>
      </Box>

      {!isFull && (
        <Box
          component='label'
          onDragOver={(event) => {
            event.preventDefault();
            if (!disabled) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            width: '100%',
            height: 110,
            px: '5px',
            border: '1px dashed',
            borderColor: dragging ? 'primary.main' : 'rgba(0, 0, 0, 0.4)',
            borderRadius: 1,
            bgcolor: dragging ? 'action.hover' : 'transparent',
            textAlign: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            transition: (theme) =>
              theme.transitions.create(['border-color', 'background-color']),
            '&:hover': { borderColor: 'primary.main' },
            '&:focus-within': { borderColor: 'primary.main' },
          }}
        >
          <Box
            component='input'
            ref={inputRef}
            type='file'
            accept={allowedTypes.join(',')}
            multiple={maxFiles > 1}
            disabled={disabled}
            onChange={handleInput}
            aria-describedby={message ? errorId : undefined}
            sx={{
              position: 'absolute',
              width: 1,
              height: 1,
              opacity: 0,
              pointerEvents: 'none',
            }}
          />

          <UploadFileIcon color='primary' sx={{ fontSize: 24 }} />

          <Typography variant='body1' sx={{ color: 'primary.main' }}>
            {label}
          </Typography>

          <Typography variant='body2' color='text.secondary'>
            {hint}
          </Typography>
        </Box>
      )}

      {previews.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
            gap: 1,
            mt: 1,
          }}
        >
          {previews.map((preview, index) => (
            <Box
              key={`${preview.file.name}-${preview.file.lastModified}-${index}`}
              sx={{ position: 'relative', aspectRatio: '1 / 1' }}
            >
              {preview.file.type.startsWith('image/') ? (
                <Box
                  component='img'
                  src={preview.url}
                  alt={preview.file.name}
                  sx={{
                    width: '100%',
                    height: '100%',
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
                    gap: 0.5,
                    height: '100%',
                    p: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    textAlign: 'center',
                  }}
                >
                  <InsertDriveFileOutlined color='action' />
                  <Typography
                    variant='caption'
                    noWrap
                    title={preview.file.name}
                    sx={{ maxWidth: '100%' }}
                  >
                    {preview.file.name}
                  </Typography>
                </Box>
              )}

              <IconButton
                size='small'
                aria-label={`Удалить ${preview.file.name}`}
                onClick={(event) => {
                  event.preventDefault();
                  removeFile(index);
                }}
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  bgcolor: 'background.paper',
                  '&:hover': { bgcolor: 'background.paper' },
                }}
              >
                <CloseOutlined fontSize='small' />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </ValidationContainer>
  );
}
