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
  roleName: string;
  team: AuthenticatedUserTeam | null;
}
