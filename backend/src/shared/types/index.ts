import { UserRoles } from '@prisma/client';

export type GetUserType = {
  uid: string;
  roles: UserRoles[];
};

export type AuthenticatedUser = {
  id: string;
  role: string;
  company_id: string;
};
