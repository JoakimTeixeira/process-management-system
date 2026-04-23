import type { Role } from '../../../common/enums/role.enum';

export interface AuthenticatedUserTeam {
  id: string;
  code: string;
  name: string;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  roleId: string;
  role: Role;
  team: AuthenticatedUserTeam | null;
}
