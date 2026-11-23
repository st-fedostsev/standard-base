import { useState, type FormEvent } from 'react';

import { AppForm } from '@/components/AppForm';
import { FieldRow } from '@/components/FieldRow';
import { FileUpload } from '@/components/FileUpload';
import { Input } from '@/components/Input';
import { ModalLayout } from '@/components/Modals/ModalLayout';
import { SwitchField } from '@/components/Modals/SwitchField';
import { Toggle, type ToggleOption } from '@/components/Modals/Toggle';
import type {
  CardCategory,
  CardResult,
  CardVisibility,
  CreateCardRequest,
} from '@/utils/types/cards';
import { ALL_FILE_TYPES } from '@/utils/types/fileTypes';
import {
  Box,
  Button,
  Collapse,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';

type MetricPair = {
  title: string;
  enabled: boolean;
  before: string;
  after: string;
};

type FormValues = {
  visibility: CardVisibility;
  title: string;
  personalFlow: string;
  industry: string;
  categoryId: string;
  metrics: MetricPair[];
  events: string[];
  files: File[];
};

type MetricErrors = {
  title?: string;
  before?: string;
  after?: string;
};

type FormErrors = {
  title?: string;
  personalFlow?: string;
  industry?: string;
  categoryId?: string;
  events?: Array<string | undefined>;
  metrics?: MetricErrors[];
};

type AddCardModalProps = {
  open: boolean;
  onClose: () => void;
  categories: CardCategory[];
  onSubmit: (payload: CreateCardRequest, photo: File | null) => Promise<void>;
};

const VISIBILITY_OPTIONS: ToggleOption<CardVisibility>[] = [
  { value: 'public', label: 'ПУБЛИЧНАЯ' },
  { value: 'protected', label: 'ЗАЩИЩЁННАЯ' },
  { value: 'private', label: 'ПРИВАТНАЯ' },
];

const METRIC_PAIRS_COUNT = 3;
const MAX_EVENTS = 10;

function createEmptyForm(): FormValues {
  return {
    visibility: 'public',
    title: '',
    personalFlow: '',
    industry: '',
    categoryId: '',
    metrics: Array.from({ length: METRIC_PAIRS_COUNT }, () => ({
      title: '',
      enabled: false,
      before: '',
      after: '',
    })),
    events: [''],
    files: [],
  };
}

/** Оставляет цифры и один десятичный разделитель. */
function sanitizeDecimal(value: string): string {
  const cleaned = value.replace(/[^\d.,]/g, '');
  const separatorIndex = cleaned.search(/[.,]/);

  if (separatorIndex === -1) {
    return cleaned;
  }

  const separator = cleaned[separatorIndex];
  const integerPart = cleaned.slice(0, separatorIndex).replace(/[.,]/g, '');
  const fractionPart = cleaned.slice(separatorIndex + 1).replace(/[.,]/g, '');

  return `${integerPart}${separator}${fractionPart}`;
}

function parseMetricNumber(value: string): number | null {
  const normalized = sanitizeDecimal(value).replace(',', '.');

  if (!normalized) {
    return null;
  }

  const number = Number(normalized);

  return Number.isFinite(number) ? number : null;
}

function hasMetricContent(metric: MetricPair): boolean {
  return Boolean(
    metric.title.trim() || metric.before.trim() || metric.after.trim()
  );
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.title.trim()) {
    errors.title = 'Укажите заголовок';
  }

  if (!values.personalFlow.trim()) {
    errors.personalFlow = 'Укажите показатель личного потока';
  }

  if (!values.industry.trim()) {
    errors.industry = 'Укажите отрасль';
  }

  if (!values.categoryId) {
    errors.categoryId = 'Выберите категорию';
  }

  if (!values.events.some((event) => event.trim())) {
    errors.events = values.events.map((event, index) =>
      index === 0 && !event.trim() ? 'Опишите мероприятие' : undefined
    );
  }

  const metricErrors = values.metrics.map((metric) => {
    const pairErrors: MetricErrors = {};

    // Полностью пустой показатель необязателен.
    if (!hasMetricContent(metric)) {
      return pairErrors;
    }

    if (!metric.title.trim()) {
      pairErrors.title = 'Укажите название показателя';
    }

    if (parseMetricNumber(metric.before) === null) {
      pairErrors.before = 'Укажите числовое значение «Было»';
    }

    if (parseMetricNumber(metric.after) === null) {
      pairErrors.after = 'Укажите числовое значение «Стало»';
    }

    return pairErrors;
  });

  if (
    metricErrors.some((metric) => metric.title || metric.before || metric.after)
  ) {
    errors.metrics = metricErrors;
  }

  return errors;
}

function toCreateCardRequest(values: FormValues): CreateCardRequest {
  const results: CardResult[] = values.metrics
    .filter(hasMetricContent)
    .map((metric) => {
      const before = parseMetricNumber(metric.before);
      const after = parseMetricNumber(metric.after);

      // До этой функции форма проходит validate.
      if (!metric.title.trim() || before === null || after === null) {
        throw new Error('Некорректно заполнен показатель');
      }

      return {
        title: metric.title.trim(),
        before,
        after,
        is_positive: metric.enabled,
      };
    });

  return {
    title: values.title.trim(),
    industry: values.industry.trim(),
    pilot_stream: values.personalFlow.trim(),
    results,
    activities: values.events.map((event) => event.trim()).filter(Boolean),
    category_id: values.categoryId,
    visibility: values.visibility,
  };
}

export function AddCardModal({
  open,
  onClose,
  categories,
  onSubmit,
}: AddCardModalProps) {
  const [values, setValues] = useState<FormValues>(createEmptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showErrors, setShowErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const applyValues = (next: FormValues) => {
    setValues(next);

    if (showErrors) {
      setErrors(validate(next));
    }

    if (submitError) {
      setSubmitError(null);
    }
  };

  const updateField = <K extends keyof FormValues>(
    key: K,
    value: FormValues[K]
  ) => {
    applyValues({ ...values, [key]: value });
  };

  const updateMetricTitle = (index: number, title: string) => {
    applyValues({
      ...values,
      metrics: values.metrics.map((metric, currentIndex) =>
        currentIndex === index ? { ...metric, title } : metric
      ),
    });
  };

  const updateMetricValue = (
    index: number,
    key: 'before' | 'after',
    value: string
  ) => {
    applyValues({
      ...values,
      metrics: values.metrics.map((metric, currentIndex) => {
        if (currentIndex !== index) {
          return metric;
        }

        const next = {
          ...metric,
          [key]: sanitizeDecimal(value),
        };

        if (
          parseMetricNumber(next.before) === null ||
          parseMetricNumber(next.after) === null
        ) {
          next.enabled = false;
        }

        return next;
      }),
    });
  };

  const updateMetricSwitch = (index: number, enabled: boolean) => {
    applyValues({
      ...values,
      metrics: values.metrics.map((metric, currentIndex) =>
        currentIndex === index ? { ...metric, enabled } : metric
      ),
    });
  };

  const updateEvent = (index: number, value: string) => {
    const events = values.events.map((event, currentIndex) =>
      currentIndex === index ? value : event
    );

    const isLast = index === values.events.length - 1;

    if (isLast && value.trim() && events.length < MAX_EVENTS) {
      events.push('');
    }

    while (
      events.length > 1 &&
      !events[events.length - 1].trim() &&
      !events[events.length - 2].trim()
    ) {
      events.pop();
    }

    applyValues({ ...values, events });
  };

  const resetForm = () => {
    setValues(createEmptyForm());
    setErrors({});
    setShowErrors(false);
    setSubmitError(null);
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    resetForm();
    onClose();
  };

  const submitForm = async () => {
    if (isSubmitting) {
      return;
    }

    const nextErrors = validate(values);

    setErrors(nextErrors);
    setShowErrors(true);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(toCreateCardRequest(values), values.files[0] ?? null);

      resetForm();
      onClose();
    } catch {
      setSubmitError('Не удалось создать карточку. Попробуйте ещё раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitForm();
  };

  const filledEventsCount = values.events.filter((event) =>
    event.trim()
  ).length;

  return (
    <ModalLayout
      open={open}
      onClose={handleClose}
      maxWidth='md'
      titleId='add-card-title'
      title={
        <>
          <Box
            component='span'
            sx={{ fontWeight: 600, textTransform: 'uppercase' }}
          >
            Создание карточки
          </Box>

          <Toggle
            value={values.visibility}
            options={VISIBILITY_OPTIONS}
            onChange={(visibility) => updateField('visibility', visibility)}
            ariaLabel='Видимость карточки'
            disabled={isSubmitting}
          />
        </>
      }
      actions={
        <>
          <Button variant='text' onClick={handleClose} disabled={isSubmitting}>
            Отмена
          </Button>

          <Button
            type='button'
            variant='contained'
            onClick={() => void submitForm()}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Отправка...' : 'Отправить на модерацию'}
          </Button>
        </>
      }
    >
      <AppForm onSubmit={handleSubmit}>
        <Input
          label='Заголовок'
          value={values.title}
          onChange={(title) => updateField('title', title)}
          errorText={errors.title}
          required
          autoFocus
          disabled={isSubmitting}
        />

        <FieldRow>
          <Input
            label='Пилотный поток'
            value={values.personalFlow}
            onChange={(personalFlow) =>
              updateField('personalFlow', personalFlow)
            }
            errorText={errors.personalFlow}
            required
            disabled={isSubmitting}
          />

          <Input
            label='Отрасль'
            value={values.industry}
            onChange={(industry) => updateField('industry', industry)}
            errorText={errors.industry}
            required
            disabled={isSubmitting}
          />
        </FieldRow>

        <FormControl
          fullWidth
          size='small'
          error={Boolean(errors.categoryId)}
          disabled={isSubmitting}
        >
          <InputLabel id='add-card-category-label'>Категория</InputLabel>

          <Select<string>
            labelId='add-card-category-label'
            label='Категория'
            value={values.categoryId}
            onChange={(event) => updateField('categoryId', event.target.value)}
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>

          {errors.categoryId && (
            <FormHelperText>{errors.categoryId}</FormHelperText>
          )}
        </FormControl>

        <Stack spacing={2.5}>
          {values.metrics.map((metric, index) => (
            <Stack key={index} spacing={1}>
              <Box sx={{ width: '50%' }}>
                <Input
                  label='Название показателя'
                  ariaLabel={`Название показателя ${index + 1}`}
                  value={metric.title}
                  onChange={(title) => updateMetricTitle(index, title)}
                  errorText={errors.metrics?.[index]?.title}
                  disabled={isSubmitting}
                />
              </Box>

              <Collapse in={metric.title.trim() !== ''} timeout='auto'>
                <Stack spacing={1}>
                  <FieldRow>
                    <Input
                      label='Было'
                      value={metric.before}
                      onChange={(before) =>
                        updateMetricValue(index, 'before', before)
                      }
                      errorText={errors.metrics?.[index]?.before}
                      disabled={isSubmitting}
                    />

                    <Input
                      label='Стало'
                      value={metric.after}
                      onChange={(after) =>
                        updateMetricValue(index, 'after', after)
                      }
                      errorText={errors.metrics?.[index]?.after}
                      disabled={isSubmitting}
                    />
                  </FieldRow>

                  {parseMetricNumber(metric.before) !== null &&
                    parseMetricNumber(metric.after) !== null && (
                      <SwitchField
                        label='Положительный результат'
                        checked={metric.enabled}
                        onChange={(enabled) =>
                          updateMetricSwitch(index, enabled)
                        }
                        disabled={isSubmitting}
                      />
                    )}
                </Stack>
              </Collapse>
            </Stack>
          ))}
        </Stack>

        <Stack spacing={1}>
          {values.events.map((event, index) => (
            <Input
              key={index}
              label='Мероприятие'
              ariaLabel={`Мероприятие ${index + 1}`}
              value={event}
              onChange={(value) => updateEvent(index, value)}
              errorText={errors.events?.[index]}
              multiline
              minRows={2}
              maxRows={3}
              required={index === 0}
              disabled={isSubmitting}
            />
          ))}

          <Typography variant='caption' color='text.secondary'>
            {filledEventsCount}/{MAX_EVENTS}
          </Typography>
        </Stack>

        <FileUpload
          value={values.files}
          onChange={(files) => updateField('files', files)}
          allowedTypes={ALL_FILE_TYPES}
          maxSizeMb={3}
          maxFiles={1}
          disabled={isSubmitting}
        />

        {submitError && (
          <Typography role='alert' color='error'>
            {submitError}
          </Typography>
        )}
      </AppForm>
    </ModalLayout>
  );
}
