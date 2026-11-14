import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom';

import { LoginPage } from '@/pages/AuthPage/LoginPage';
import { RegisterPage } from '@/pages/AuthPage/RegisterPage';

import { CardsPage } from '../pages/CardPage/CardsPage';
import { ContentLayout } from './ContentLayout';

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='/login' element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />
      <Route element={<ContentLayout />}>
        <Route element={<CardsPage />} path='/' />
        {/* <Route
        path="/admin"
        element={
          <PermissionGuard minRole="admin" fallback={<Navigate to="/" replace />}>
            <AdminPage />
          </PermissionGuard>
        }
      /> */}
      </Route>
    </>
  )
);
