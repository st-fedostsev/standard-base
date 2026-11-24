import type { Role } from './roles';

/** Пользователь, ожидающий решения администратора. */
export type PendingUser = {
  id: string;
  firstName: string;
  lastName: string;
  patronymic: string | null;
  email: string;
  role: Role;
  avatarUrl: string | null;
};

/** Решение по заявке на согласование. */
export type ModerationAction = 'approve' | 'reject';
