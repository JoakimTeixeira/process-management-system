import { routes } from './app.routes';

describe('backoffice routes', () => {
  it('keeps login anonymous-only and the shell authenticated', () => {
    const loginRoute = routes.find((route) => route.path === 'login');
    const shellRoute = routes.find((route) => route.path === '');

    expect(loginRoute?.canActivate?.length).toBe(1);
    expect(shellRoute?.canActivate?.length).toBe(1);
  });

  it('restricts editor-only content mutation routes to EDITOR', () => {
    const editorOnlyPaths = [
      'areas',
      'areas/new',
      'areas/:id/edit',
      'processes/new',
      'processes/:id/edit',
      'processes/:id/versions/new',
      'glossary/new',
      'glossary/:id/edit',
    ];

    const shellChildren =
      routes.find((route) => route.path === '')?.children ?? [];

    for (const path of editorOnlyPaths) {
      expect(
        shellChildren.find((route) => route.path === path)?.data?.['roles'],
      ).toEqual(['EDITOR']);
    }
  });

  it('allows content consultation routes to content roles and admin routes to SYSTEM_ADMIN only', () => {
    const shellChildren =
      routes.find((route) => route.path === '')?.children ?? [];
    const contentRoles = ['EDITOR', 'REVIEWER', 'PUBLISHER', 'VIEWER'];

    for (const path of [
      'processes',
      'processes/:id/versions',
      'procedures',
      'versions/:id',
      'glossary',
    ]) {
      expect(
        shellChildren.find((route) => route.path === path)?.data?.['roles'],
      ).toEqual(contentRoles);
    }

    for (const path of [
      'admin/users',
      'admin/teams',
      'admin/teams/new',
      'admin/teams/:id/edit',
      'admin/users/new',
      'admin/users/:id/edit',
    ]) {
      expect(
        shellChildren.find((route) => route.path === path)?.data?.['roles'],
      ).toEqual(['SYSTEM_ADMIN']);
    }
  });

  it('provides breadcrumb metadata for the main backoffice workspaces', () => {
    const shellChildren =
      routes.find((route) => route.path === '')?.children ?? [];

    for (const path of [
      '',
      'areas',
      'areas/new',
      'areas/:id/edit',
      'processes',
      'processes/new',
      'processes/:id/edit',
      'processes/:id/versions',
      'processes/:id/versions/new',
      'procedures',
      'versions/:id',
      'glossary',
      'glossary/new',
      'glossary/:id/edit',
      'admin/users',
      'admin/teams',
      'admin/teams/new',
      'admin/teams/:id/edit',
      'admin/users/new',
      'admin/users/:id/edit',
    ]) {
      expect(shellChildren.find((route) => route.path === path)?.data?.['breadcrumb']).toBeDefined();
    }
  });

  it('hides breadcrumbs on entry list pages while keeping them on deeper workflows', () => {
    const shellChildren =
      routes.find((route) => route.path === '')?.children ?? [];

    for (const path of [
      '',
      'areas',
      'processes',
      'procedures',
      'glossary',
      'admin/users',
      'admin/teams',
    ]) {
      expect(shellChildren.find((route) => route.path === path)?.data?.['breadcrumbVisible']).toBeFalse();
    }

    for (const path of [
      'areas/new',
      'areas/:id/edit',
      'processes/:id/versions',
      'processes/:id/versions/new',
      'versions/:id',
      'glossary/new',
      'glossary/:id/edit',
      'admin/users/new',
      'admin/users/:id/edit',
      'admin/teams/new',
      'admin/teams/:id/edit',
    ]) {
      expect(shellChildren.find((route) => route.path === path)?.data?.['breadcrumbVisible']).not.toBeFalse();
    }
  });
});
