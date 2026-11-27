import { useEffect, useRef, useState, type FormEvent } from 'react';

import { AppForm } from '@/components/AppForm';
import { FieldRow } from '@/components/FieldRow';
import { FileUpload } from '@/components/FileUpload';
import { Input } from '@/components/Input';
import { FormSection } from '@/components/Modals/FormSection';
import { ModalLayout } from '@/components/Modals/ModalLayout';
import { SwitchField } from '@/components/Modals/SwitchField';
import { Toggle, type ToggleOption } from '@/components/Modals/Toggle';
import { useToast, type ToastOptions } from '@/components/Toast';
import { TruncatedText } from '@/components/TruncatedText';
import type {
  CardCategory,
  CreateCardResult,
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

/** Мягкие лимиты полей: защищают от случайно огромного текста. */
const TITLE_MAX_LENGTH = 120;
const SHORT_TEXT_MAX_LENGTH = 60;
const METRIC_TITLE_MAX_LENGTH = 80;
const EVENT_MAX_LENGTH = 300;

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

/** Короткое описание ошибок для Toast. */
function getValidationMessage(errors: FormErrors): string {
  const missing: string[] = [];

  if (errors.title) missing.push('Заголовок');
  if (errors.categoryId) missing.push('Категория');
  if (errors.industry) missing.push('Отрасль');
  if (errors.personalFlow) missing.push('Пилотный поток');

  errors.events?.forEach((error, index) => {
    if (error) missing.push(`Мероприятие ${index + 1}`);
  });

  const metricIssues =
    errors.metrics
      ?.map((metric, index) => {
        const fields: string[] = [];

        if (metric.title) fields.push('название');
        if (metric.before) fields.push('«Было»');
        if (metric.after) fields.push('«Стало»');

        return fields.length > 0
          ? `Показатель ${index + 1}: ${fields.join(', ')}`
          : null;
      })
      .filter((issue): issue is string => issue !== null) ?? [];

  const parts: string[] = [];

  if (missing.length > 0) {
    parts.push(`Заполните обязательные поля: ${missing.join(', ')}`);
  }

  if (metricIssues.length > 0) {
    parts.push(metricIssues.join('. '));
  }

  return parts.length > 0 ? `${parts.join('. ')}.` : 'Заполните форму';
}

function toCreateCardRequest(values: FormValues): CreateCardRequest {
  const results: CreateCardResult[] = values.metrics
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
  const { showToast, dismissToast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const lastToastId = useRef<string | null>(null);
  const [values, setValues] = useState<FormValues>(createEmptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showErrors, setShowErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [focusRequest, setFocusRequest] = useState(0);

  const replaceToast = (options: ToastOptions) => {
    if (lastToastId.current) {
      dismissToast(lastToastId.current);
    }

    lastToastId.current = showToast(options);
  };

  // Ошибки уже в DOM: можно перевести фокус к первому невалидному полю.
  useEffect(() => {
    if (focusRequest === 0) {
      return;
    }

    const form = formRef.current;

    if (!form) {
      return;
    }

    const target =
      form.querySelector<HTMLElement>('[aria-invalid="true"]') ??
      form.querySelector<HTMLElement>('[role="combobox"]');

    if (!target) {
      return;
    }

    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [focusRequest]);

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

  const clearMetric = (index: number) => {
    applyValues({
      ...values,
      metrics: values.metrics.map((metric, currentIndex) =>
        currentIndex === index
          ? { title: '', enabled: false, before: '', after: '' }
          : metric
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

    if (lastToastId.current) {
      dismissToast(lastToastId.current);
      lastToastId.current = null;
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
      replaceToast({
        title: 'Проверьте форму',
        message: getValidationMessage(nextErrors),
        use: 'warning',
      });
      setFocusRequest((request) => request + 1);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(toCreateCardRequest(values), values.files[0] ?? null);

      replaceToast({
        message: 'Карточка отправлена на модерацию',
        use: 'success',
      });

      resetForm();
      onClose();
    } catch {
      const message = 'Не удалось создать карточку. Попробуйте ещё раз.';

      setSubmitError(message);
      replaceToast({ message, use: 'error' });
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
      <AppForm onSubmit={handleSubmit} formRef={formRef}>
        <FormSection title='Основное'>
          <FieldRow columns='minmax(0, 2fr) minmax(0, 1fr)'>
            <Input
              label='Заголовок'
              name='title'
              value={values.title}
              onChange={(title) => updateField('title', title)}
              errorText={errors.title}
              helperText='Название карточки в таблице.'
              required
              autoFocus
              multiline
              minRows={1}
              maxRows={3}
              maxLength={TITLE_MAX_LENGTH}
              placeholder='Например: Программа наставничества'
              disabled={isSubmitting}
            />

            <FormControl
              fullWidth
              size='small'
              error={Boolean(errors.categoryId)}
              disabled={isSubmitting}
              required
            >
              <InputLabel id='add-card-category-label'>Категория</InputLabel>

              <Select<string>
                labelId='add-card-category-label'
                label='Категория'
                name='categoryId'
                value={values.categoryId}
                onChange={(event) =>
                  updateField('categoryId', event.target.value)
                }
                renderValue={(selected) => {
                  const category = categories.find(
                    (item) => item.id === selected
                  );

                  return category ? (
                    <TruncatedText value={category.name} />
                  ) : (
                    ''
                  );
                }}
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
          </FieldRow>

          <FieldRow>
            <Input
              label='Отрасль'
              name='industry'
              value={values.industry}
              onChange={(industry) => updateField('industry', industry)}
              errorText={errors.industry}
              required
              multiline
              minRows={1}
              maxRows={2}
              maxLength={SHORT_TEXT_MAX_LENGTH}
              placeholder='Например: Финансы'
              disabled={isSubmitting}
            />

            <Input
              label='Пилотный поток'
              name='personalFlow'
              value={values.personalFlow}
              onChange={(personalFlow) =>
                updateField('personalFlow', personalFlow)
              }
              errorText={errors.personalFlow}
              helperText='Показатель личного потока.'
              required
              multiline
              minRows={1}
              maxRows={2}
              maxLength={SHORT_TEXT_MAX_LENGTH}
              placeholder='Например: 10 000'
              disabled={isSubmitting}
            />
          </FieldRow>
        </FormSection>

        <FormSection
          title='Показатели'
          description='Необязательно. Заполните, если есть динамика «Было → Стало».'
        >
          <Stack spacing={1.5}>
            {values.metrics.map((metric, index) => (
              <Box
                key={index}
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1.5,
                }}
              >
                <Stack spacing={1.5}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                    }}
                  >
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ fontWeight: 600 }}
                    >
                      Показатель {index + 1}
                    </Typography>

                    {hasMetricContent(metric) && (
                      <Button
                        size='small'
                        variant='text'
                        onClick={() => clearMetric(index)}
                        disabled={isSubmitting}
                      >
                        Очистить
                      </Button>
                    )}
                  </Box>

                  <Input
                    label='Название показателя'
                    ariaLabel={`Название показателя ${index + 1}`}
                    name={`metric-${index}-title`}
                    value={metric.title}
                    onChange={(title) => updateMetricTitle(index, title)}
                    errorText={errors.metrics?.[index]?.title}
                    multiline
                    minRows={1}
                    maxRows={2}
                    maxLength={METRIC_TITLE_MAX_LENGTH}
                    placeholder='Например: Конверсия'
                    disabled={isSubmitting}
                  />

                  <Collapse in={metric.title.trim() !== ''} timeout='auto'>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr',
                          sm: '1fr 1fr',
                          md: 'minmax(0, 1fr) minmax(0, 1fr) auto',
                        },
                        alignItems: 'start',
                        gap: 1.5,
                      }}
                    >
                      <Input
                        label='Было'
                        name={`metric-${index}-before`}
                        value={metric.before}
                        onChange={(before) =>
                          updateMetricValue(index, 'before', before)
                        }
                        errorText={errors.metrics?.[index]?.before}
                        placeholder='0'
                        disabled={isSubmitting}
                      />

                      <Input
                        label='Стало'
                        name={`metric-${index}-after`}
                        value={metric.after}
                        onChange={(after) =>
                          updateMetricValue(index, 'after', after)
                        }
                        errorText={errors.metrics?.[index]?.after}
                        placeholder='0'
                        disabled={isSubmitting}
                      />

                      {parseMetricNumber(metric.before) !== null &&
                        parseMetricNumber(metric.after) !== null && (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              minHeight: 40,
                            }}
                          >
                            <SwitchField
                              label='Положительный результат'
                              checked={metric.enabled}
                              onChange={(enabled) =>
                                updateMetricSwitch(index, enabled)
                              }
                              disabled={isSubmitting}
                            />
                          </Box>
                        )}
                    </Box>
                  </Collapse>
                </Stack>
              </Box>
            ))}
          </Stack>
        </FormSection>

        <FormSection
          title='Мероприятия'
          description='Опишите, что сделали или планируете. Новое поле появится автоматически.'
        >
          <Stack spacing={1.5}>
            {values.events.map((event, index) => (
              <Input
                key={index}
                label={`Мероприятие ${index + 1}`}
                ariaLabel={`Мероприятие ${index + 1}`}
                name={`event-${index}`}
                value={event}
                onChange={(value) => updateEvent(index, value)}
                errorText={errors.events?.[index]}
                multiline
                minRows={2}
                maxRows={4}
                maxLength={EVENT_MAX_LENGTH}
                placeholder='Например: провели встречу с командой'
                required={index === 0}
                disabled={isSubmitting}
              />
            ))}

            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ textAlign: 'right' }}
            >
              Заполнено {filledEventsCount} из {MAX_EVENTS}
            </Typography>
          </Stack>
        </FormSection>

        <FormSection title='Обложка'>
          <FileUpload
            value={values.files}
            onChange={(files) => updateField('files', files)}
            allowedTypes={ALL_FILE_TYPES}
            maxSizeMb={3}
            maxFiles={1}
            disabled={isSubmitting}
          />
        </FormSection>

        {submitError && (
          <Typography role='alert' color='error'>
            {submitError}
          </Typography>
        )}
      </AppForm>
    </ModalLayout>
  );
}
