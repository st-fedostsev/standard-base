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

type LoginFormValues = {
  email: string;
  password: string;
};

type FormErrors = Partial<Record<keyof LoginFormValues, string>>;

function validate(values: LoginFormValues): FormErrors {
  const errors: FormErrors = {};
  const email = values.email.trim();

  if (!email) {
    errors.email = 'Укажите почту';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Введите корректный адрес почты';
  }

  if (!values.password) {
    errors.password = 'Укажите пароль';
  }

  return errors;
}

export function LoginPage() {
  const navigate = useNavigate();
  const { startSession } = useAuth();

  const [values, setValues] = useState<LoginFormValues>({
    email: '',
    password: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loginPending, setLoginPending] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [codeId, setCodeId] = useState<string | null>(null);
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);
  const [code, setCode] = useState('');
  const [codePending, setCodePending] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  // После первой отправки ошибки обновляются при редактировании полей.
  const errors: FormErrors = submitted ? validate(values) : {};

  const updateField = (key: keyof LoginFormValues, value: string) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setLoginError(null);
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loginPending || codeId) return;

    setSubmitted(true);

    if (Object.keys(validate(values)).length > 0) {
      return;
    }

    setLoginError(null);
    setLoginPending(true);

    try {
      const response = await api.Auth.login({
        email: values.email.trim(),
        password: values.password,
      });

      if (typeof response?.codeId !== 'string' || !response.codeId) {
        throw new Error('Сервер не вернул code_id');
      }

      setCodeId(response.codeId);
      setCode('');
      setCodeError(null);

      // Пароль больше не нужен для ввода OTP.
      setValues((previous) => ({ ...previous, password: '' }));
      setSubmitted(false);

      setCodeDialogOpen(true);
    } catch {
      setLoginError(
        'Не удалось выполнить вход. Проверьте данные и попробуйте снова.'
      );
    } finally {
      setLoginPending(false);
    }
  };

  const handleCheckCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (codePending) return;

    if (!codeId) {
      setCodeError('Идентификатор кода не найден. Начните вход заново.');
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

      // AuthProvider сохранит токен и запросит /users/me.
      startSession(response.accessToken);

      setCode('');
      setCodeId(null);
      setCodeDialogOpen(false);

      navigate('/', { replace: true });
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

  const formDisabled = loginPending || codeId !== null;

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
            Вход
          </Typography>

          <AppForm onSubmit={handleLogin}>
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
              autoComplete='current-password'
              errorText={errors.password}
              required
              disabled={formDisabled}
            />

            {loginError && <Alert severity='error'>{loginError}</Alert>}

            <Button
              type='submit'
              variant='contained'
              disabled={formDisabled}
              sx={{ mt: 1 }}
            >
              {loginPending ? 'Вход...' : 'Войти'}
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
            Нет аккаунта?{' '}
            <Link component={RouterLink} to='/register'>
              Зарегистрироваться
            </Link>
          </Typography>
        </Box>
      </Box>

      <Dialog
        open={codeDialogOpen}
        onClose={closeCodeDialog}
        fullWidth
        maxWidth='xs'
        aria-labelledby='login-code-title'
      >
        <Box component='form' onSubmit={handleCheckCode}>
          <DialogTitle id='login-code-title'>Подтверждение входа</DialogTitle>

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
                // Код хранится строкой, чтобы сохранить начальные нули.
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
