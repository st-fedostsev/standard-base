import { useState, type FormEvent } from 'react';

import {
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';

import { AppForm } from '@/components/AppForm';
import { Input } from '@/components/Input';
import { FileUpload } from '@/components/Modals/FileUpload';
import { SwitchField } from '@/components/Modals/SwitchField';
import { Switcher, type SwitcherOption } from '@/components/Modals/Switcher';
import { FieldRow } from '@/components/RemoveComponents';

type Visibility = 'public' | 'protected' | 'private';

type MetricPair = {
  title: string;
  enabled: boolean;
  before: string;
  after: string;
};

/** Значения формы. */
type FormValues = {
  visibility: Visibility;
  title: string;
  personalFlow: string;
  industry: string;
  mainResult: string;
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
  mainResult?: string;
  events?: Array<string | undefined>;
  metrics?: MetricErrors[];
};

const VISIBILITY_OPTIONS: SwitcherOption<Visibility>[] = [
  { value: 'public', label: 'ПУБЛИЧНАЯ' },
  { value: 'protected', label: 'ЗАЩИЩЁННАЯ' },
  { value: 'private', label: 'ПРИВАТНАЯ' },
];

const METRIC_PAIRS_COUNT = 3;
const MAX_EVENTS = 10;

const EMPTY_FORM: FormValues = {
  visibility: 'public',
  title: '',
  personalFlow: '',
  industry: '',
  mainResult: '',
  metrics: Array.from({ length: METRIC_PAIRS_COUNT }, () => ({
    title: '',
    enabled: false,
    before: '',
    after: '',
  })),
  events: [''],
  files: [],
};

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

/** Значение заполнено, если в нём есть хотя бы одна цифра. */
function hasMetricValue(value: string): boolean {
  return /\d/.test(value);
}

/** Проверка формы. */
function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (values.title.trim() === '') {
    errors.title = 'Укажите заголовок';
  }
  if (values.personalFlow.trim() === '') {
    errors.personalFlow = 'Укажите показатель личного потока';
  }
  if (values.industry.trim() === '') {
    errors.industry = 'Укажите отрасль';
  }
  if (values.mainResult.trim() === '') {
    errors.mainResult = 'Опишите основной результат';
  }

  const events = values.events.map((event, index) =>
    index === 0 && event.trim() === '' ? 'Опишите мероприятие' : undefined
  );

  if (events.some(Boolean)) {
    errors.events = events;
  }

  const metrics = values.metrics.map((pair) => {
    const pairErrors: MetricErrors = {};

    if (pair.title.trim() === '') {
      pairErrors.title = 'Напишите заголовок';
      return pairErrors;
    }

    if (!hasMetricValue(pair.before)) {
      pairErrors.before = 'Укажите значение «Было»';
    }
    if (!hasMetricValue(pair.after)) {
      pairErrors.after = 'Укажите значение «Стало»';
    }

    return pairErrors;
  });

  if (metrics.some((pair) => pair.title || pair.before || pair.after)) {
    errors.metrics = metrics;
  }

  return errors;
}

type AddCardModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: FormValues) => void;
};

export function AddCardModal({ open, onClose, onSubmit }: AddCardModalProps) {
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showErrors, setShowErrors] = useState(false);

  const applyValues = (next: FormValues) => {
    setValues(next);
    if (showErrors) {
      setErrors(validate(next));
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
      metrics: values.metrics.map((pair, i) =>
        i === index ? { ...pair, title } : pair
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
      metrics: values.metrics.map((pair, i) => {
        if (i !== index) {
          return pair;
        }

        const next = { ...pair, [key]: sanitizeDecimal(value) };

        if (!hasMetricValue(next.before) || !hasMetricValue(next.after)) {
          next.enabled = false;
        }

        return next;
      }),
    });
  };

  const updateMetricSwitch = (index: number, enabled: boolean) => {
    applyValues({
      ...values,
      metrics: values.metrics.map((pair, i) =>
        i === index ? { ...pair, enabled } : pair
      ),
    });
  };

  const updateEvent = (index: number, value: string) => {
    const events = values.events.map((event, i) =>
      i === index ? value : event
    );
    const isLast = index === values.events.length - 1;

    if (isLast && value.trim() !== '' && events.length < MAX_EVENTS) {
      events.push('');
    }

    while (
      events.length > 1 &&
      events[events.length - 1].trim() === '' &&
      events[events.length - 2].trim() === ''
    ) {
      events.pop();
    }

    applyValues({ ...values, events });
  };

  const resetForm = () => {
    setValues(EMPTY_FORM);
    setErrors({});
    setShowErrors(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const submitForm = () => {
    const nextErrors = validate(values);

    setErrors(nextErrors);
    setShowErrors(true);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit({
      ...values,
      events: values.events
        .map((event) => event.trim())
        .filter((event) => event !== ''),
    });
    resetForm();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitForm();
  };

  const filledEventsCount = values.events.filter(
    (event) => event.trim() !== ''
  ).length;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth='md'
      aria-labelledby='add-card-title'
    >
      <DialogTitle
        id='add-card-title'
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'nowrap',
          gap: 2,
        }}
      >
        <Box
          component='span'
          sx={{ fontWeight: 600, textTransform: 'uppercase' }}
        >
          Создание карточки
        </Box>

        <Switcher
          value={values.visibility}
          options={VISIBILITY_OPTIONS}
          onChange={(visibility) => updateField('visibility', visibility)}
          ariaLabel='Видимость карточки'
        />
      </DialogTitle>

      <DialogContent>
        <AppForm onSubmit={handleSubmit}>
          <Input
            label='Заголовок'
            value={values.title}
            onChange={(title) => updateField('title', title)}
            errorText={errors.title}
            required
            autoFocus
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
            />
            <Input
              label='Отрасль'
              value={values.industry}
              onChange={(industry) => updateField('industry', industry)}
              errorText={errors.industry}
              required
            />
          </FieldRow>

          <Input
            label='Основной результат'
            value={values.mainResult}
            onChange={(mainResult) => updateField('mainResult', mainResult)}
            errorText={errors.mainResult}
            multiline
            minRows={2}
            maxRows={6}
            required
          />

          <Stack spacing={2.5}>
            {values.metrics.map((pair, index) => (
              <Stack key={index} spacing={1}>
                <Box sx={{ width: '50%' }}>
                  <Input
                    label='Напишите заголовок'
                    ariaLabel={`Заголовок показателя ${index + 1}`}
                    value={pair.title}
                    onChange={(title) => updateMetricTitle(index, title)}
                    errorText={errors.metrics?.[index]?.title}
                    multiline
                    minRows={1}
                    maxRows={3}
                    required
                  />
                </Box>

                <Collapse in={pair.title.trim() !== ''} timeout='auto'>
                  <Stack spacing={1}>
                    <FieldRow>
                      <Input
                        label='Показатель'
                        placeholder='Было'
                        value={pair.before}
                        onChange={(before) =>
                          updateMetricValue(index, 'before', before)
                        }
                        errorText={errors.metrics?.[index]?.before}
                        required
                      />
                      <Input
                        ariaLabel={`Стало, показатель ${index + 1}`}
                        placeholder='Стало'
                        value={pair.after}
                        onChange={(after) =>
                          updateMetricValue(index, 'after', after)
                        }
                        errorText={errors.metrics?.[index]?.after}
                      />
                    </FieldRow>
                    {hasMetricValue(pair.before) &&
                      hasMetricValue(pair.after) && (
                        <SwitchField
                          label='Положительный результат'
                          checked={pair.enabled}
                          onChange={(enabled) =>
                            updateMetricSwitch(index, enabled)
                          }
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
              />
            ))}

            <Typography variant='caption' color='text.secondary'>
              {filledEventsCount}/{MAX_EVENTS}
            </Typography>
          </Stack>

          <FileUpload
            value={values.files}
            onChange={(files) => updateField('files', files)}
            maxFiles={1}
          />
        </AppForm>
      </DialogContent>

      <DialogActions>
        <Button variant='text' onClick={handleClose}>
          Отмена
        </Button>

        <Button type='button' variant='contained' onClick={submitForm}>
          Отправить на модерацию
        </Button>
      </DialogActions>
    </Dialog>
  );
}
