import {
  Navigate,
  Outlet,
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom';

import { LoginPage } from '@/pages/AuthPage/LoginPage';
import { RegisterPage } from '@/pages/AuthPage/RegisterPage';
import { GlobalRouterErrorPage } from '@/pages/ErrorPage/GlobalRouterErrorPage';
import { ModerationPage } from '@/pages/ModerationPage/ModerationPage';

import { CardsPage } from '../pages/CardPage/CardsPage';
import { ContentLayout } from './ContentLayout';

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Outlet />} errorElement={<GlobalRouterErrorPage />}>
      <Route element={<Navigate to='/base' replace />} />

      {/* Публичные маршруты */}
      <Route path='/login' element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />

      {/* Маршруты приложения */}
      <Route element={<ContentLayout />}>
        <Route path='base' element={<CardsPage />} />
        <Route path='moderation' element={<ModerationPage />} />
      </Route>
    </Route>
  )
);
