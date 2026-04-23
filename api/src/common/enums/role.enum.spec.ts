import {
  GOVERNANCE_ROUTE_ROLE_ALLOWLISTS,
  GOVERNANCE_ROUTE_ROLE_EXCLUSIONS,
  Role,
} from './role.enum';

describe('role governance helpers', () => {
  it('explicitly excludes SYSTEM_ADMIN from every governance route helper', () => {
    expect(GOVERNANCE_ROUTE_ROLE_EXCLUSIONS).toEqual({
      approve: [Role.SYSTEM_ADMIN],
      reject: [Role.SYSTEM_ADMIN],
      reopen: [Role.SYSTEM_ADMIN],
      publish: [Role.SYSTEM_ADMIN],
      archive: [Role.SYSTEM_ADMIN],
      promote: [Role.SYSTEM_ADMIN],
    });
  });

  it('never includes SYSTEM_ADMIN in governance allowlists', () => {
    Object.values(GOVERNANCE_ROUTE_ROLE_ALLOWLISTS).forEach((roles) => {
      expect(roles).not.toContain(Role.SYSTEM_ADMIN);
    });
  });
});
