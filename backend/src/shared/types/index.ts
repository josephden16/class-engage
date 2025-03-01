import { Role } from "@prisma/client";

export type GetUserType = {
  uid: string;
  roles: Role[];
};

export type AuthenticatedUser = {
  id: string;
  role: string;
  company_id: string;
};
