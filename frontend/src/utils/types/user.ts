import type { Role } from './roles';

export type CurrentUser = {
  id: string;
  firstName: string;
  lastName: string;
  patronymic?: string | null;
  avatarUrl?: string | null;
  //   organization - TODO: уточнить нужно ли
  role: Role;
};
