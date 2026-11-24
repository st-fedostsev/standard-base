import { useState, type FormEvent } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import { AppForm } from '@/components/AppForm';
import { Input } from '@/components/Input';
import { api } from '@/utils/api';
import { useAuth } from '@/utils/hooks/useAuth';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Link,
  TextField,
  Typography,
} from '@mui/material';

type RegisterFormValues = {
  lastName: string;
  firstName: string;
  patronymic: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type FormErrors = Partial<Record<keyof RegisterFormValues, string>>;

const INITIAL_VALUES: RegisterFormValues = {
  lastName: '',
  firstName: '',
  patronymic: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const PASSWORD_SPECIAL_CHARS = '@#$%^&()_+|~-\\{}[]:";\'?,./!';

/** Проверки на клиенте. Окончательную валидацию выполняет сервер. */
function validate(values: RegisterFormValues): FormErrors {
  const errors: FormErrors = {};

  // Буквы разных языков, пробелы, дефис и апостроф.
  // Это предварительное правило — согласуйте его с бэкендером.
  const namePattern = /^\p{L}[\p{L}\p{M}\s'-]*$/u;

  const lastName = values.lastName.trim();
  const firstName = values.firstName.trim();
  const patronymic = values.patronymic.trim();
  const email = values.email.trim();

  if (!lastName) {
    errors.lastName = 'Укажите фамилию';
  } else if (!namePattern.test(lastName)) {
    errors.lastName = 'Введите корректную фамилию';
  }

  if (!firstName) {
    errors.firstName = 'Укажите имя';
  } else if (!namePattern.test(firstName)) {
    errors.firstName = 'Введите корректное имя';
  }

  // Отчество необязательно, но если введено — проверяем.
  if (patronymic && !namePattern.test(patronymic)) {
    errors.patronymic = 'Введите корректное отчество';
  }

  if (!email) {
    errors.email = 'Укажите почту';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Введите корректный адрес почты';
  }

  if (!values.password) {
    errors.password = 'Укажите пароль';
  } else {
    const passwordErrors: string[] = [];

    if (Array.from(values.password).length < 8) {
      passwordErrors.push('минимум 8 символов');
    }

    if (!/\p{Lu}/u.test(values.password)) {
      passwordErrors.push('хотя бы одна заглавная буква');
    }

    const hasSpecialChar = Array.from(values.password).some((char) =>
      PASSWORD_SPECIAL_CHARS.includes(char)
    );

    if (!hasSpecialChar) {
      passwordErrors.push(
        'хотя бы один разрешённый спецсимвол: @#$%^&()_+|~-\\{}[]:";\'?,./!'
      );
    }

    if (passwordErrors.length > 0) {
      errors.password = `Пароль: ${passwordErrors.join(', ')}.`;
    }
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Подтвердите пароль';
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Пароли не совпадают';
  }

  return errors;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { startSession } = useAuth();

  const [values, setValues] = useState<RegisterFormValues>(INITIAL_VALUES);
  const [submitted, setSubmitted] = useState(false);
  const [registerPending, setRegisterPending] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const [codeId, setCodeId] = useState<string | null>(null);
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);
  const [code, setCode] = useState('');
  const [codePending, setCodePending] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  // После первой попытки отправки ошибки обновляются при исправлении полей.
  const errors: FormErrors = submitted ? validate(values) : {};

  const updateField = (key: keyof RegisterFormValues, value: string) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setRegisterError(null);
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (registerPending || codeId) return;

    setSubmitted(true);

    if (Object.keys(validate(values)).length > 0) {
      return;
    }

    setRegisterError(null);
    setRegisterPending(true);

    try {
      const patronymic = values.patronymic.trim();

      const response = await api.Auth.register({
        first_name: values.firstName.trim(),
        last_name: values.lastName.trim(),
        email: values.email.trim(),
        password: values.password,
        ...(patronymic ? { patronymic } : {}),
      });

      if (typeof response?.codeId !== 'string' || !response.codeId) {
        throw new Error('Сервер не вернул code_id');
      }

      setCodeId(response.codeId);
      setCode('');
      setCodeError(null);

      // Пароли больше не нужны для подтверждения кода.
      setValues((previous) => ({
        ...previous,
        password: '',
        confirmPassword: '',
      }));
      setSubmitted(false);

      setCodeDialogOpen(true);
    } catch {
      setRegisterError(
        'Не удалось зарегистрироваться. Проверьте данные и попробуйте снова.'
      );
    } finally {
      setRegisterPending(false);
    }
  };

  const handleCheckCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (codePending) return;

    if (!codeId) {
      setCodeError('Идентификатор кода не найден. Начните регистрацию заново.');
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setCodeError('Введите шестизначный код.');
      return;
    }

    setCodeError(null);
    setCodePending(true);

    try {
      const response = await api.Auth.checkCode({
        code_id: codeId,
        code_otp: code,
      });

      if (typeof response?.accessToken !== 'string' || !response.accessToken) {
        throw new Error('Сервер не вернул access_token');
      }

      startSession(response.accessToken);

      setCode('');
      setCodeId(null);
      setCodeDialogOpen(false);

      navigate('/base', { replace: true });
    } catch {
      setCodeError('Не удалось подтвердить код. Попробуйте снова.');
    } finally {
      setCodePending(false);
    }
  };

  const closeCodeDialog = () => {
    if (!codePending) {
      setCodeDialogOpen(false);
    }
  };

  // После получения code_id данные уже отправлены.
  const formDisabled = registerPending || codeId !== null;

  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          bgcolor: 'background.default',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 480,
            p: { xs: 3, sm: 4 },
            borderRadius: 2,
            bgcolor: 'grey.100',
          }}
        >
          <Typography
            component='h1'
            variant='h4'
            sx={{ textAlign: 'center', fontWeight: 600, mb: 3 }}
          >
            Регистрация
          </Typography>

          <AppForm onSubmit={handleRegister}>
            <Input
              label='Фамилия'
              name='lastName'
              value={values.lastName}
              onChange={(value) => updateField('lastName', value)}
              autoComplete='family-name'
              errorText={errors.lastName}
              required
              disabled={formDisabled}
            />

            <Input
              label='Имя'
              name='firstName'
              value={values.firstName}
              onChange={(value) => updateField('firstName', value)}
              autoComplete='given-name'
              errorText={errors.firstName}
              required
              disabled={formDisabled}
            />

            <Input
              label='Отчество'
              name='patronymic'
              value={values.patronymic}
              onChange={(value) => updateField('patronymic', value)}
              autoComplete='additional-name'
              disabled={formDisabled}
            />

            <Input
              label='Почта'
              name='email'
              type='email'
              value={values.email}
              onChange={(value) => updateField('email', value)}
              autoComplete='email'
              errorText={errors.email}
              required
              disabled={formDisabled}
            />

            <Input
              label='Пароль'
              name='password'
              type='password'
              value={values.password}
              onChange={(value) => updateField('password', value)}
              autoComplete='new-password'
              errorText={errors.password}
              required
              disabled={formDisabled}
            />

            <Input
              label='Подтверждение пароля'
              name='confirmPassword'
              type='password'
              value={values.confirmPassword}
              onChange={(value) => updateField('confirmPassword', value)}
              autoComplete='new-password'
              errorText={errors.confirmPassword}
              required
              disabled={formDisabled}
            />

            {registerError && <Alert severity='error'>{registerError}</Alert>}

            <Button
              type='submit'
              variant='contained'
              disabled={formDisabled}
              sx={{ mt: 1 }}
            >
              {registerPending ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
          </AppForm>

          {codeId && (
            <Button
              fullWidth
              type='button'
              onClick={() => setCodeDialogOpen(true)}
              sx={{ mt: 1 }}
            >
              Ввести код подтверждения
            </Button>
          )}

          <Typography variant='body2' sx={{ textAlign: 'center', mt: 2 }}>
            Уже есть аккаунт?{' '}
            <Link component={RouterLink} to='/login'>
              Войти
            </Link>
          </Typography>
        </Box>
      </Box>

      <Dialog
        open={codeDialogOpen}
        onClose={closeCodeDialog}
        fullWidth
        maxWidth='xs'
        aria-labelledby='registration-code-title'
      >
        <Box component='form' onSubmit={handleCheckCode}>
          <DialogTitle id='registration-code-title'>
            Подтверждение регистрации
          </DialogTitle>

          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Введите шестизначный код, отправленный на почту.
            </DialogContentText>

            <TextField
              autoFocus
              fullWidth
              size='small'
              label='Код подтверждения'
              value={code}
              disabled={codePending}
              error={Boolean(codeError)}
              helperText={codeError}
              onChange={(event) => {
                // Код — строка: начальные нули сохраняются.
                setCode(event.target.value.replace(/\D/g, '').slice(0, 6));
                setCodeError(null);
              }}
              slotProps={{
                htmlInput: {
                  inputMode: 'numeric',
                  autoComplete: 'one-time-code',
                  maxLength: 6,
                },
              }}
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={closeCodeDialog} disabled={codePending}>
              Отмена
            </Button>

            <Button
              type='submit'
              variant='contained'
              disabled={code.length !== 6 || codePending}
            >
              {codePending ? 'Проверка...' : 'Подтвердить'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}
