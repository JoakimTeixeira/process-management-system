import { Routes } from '@angular/router';

import { anonymousOnlyGuard, authGuard, roleGuard } from './core/auth/auth.guard';
import { AppRole } from './core/models/backoffice.models';

const CONTENT_ROLES: AppRole[] = ['EDITOR', 'REVIEWER', 'PUBLISHER', 'VIEWER'];

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [anonymousOnlyGuard],
    loadComponent: () =>
      import('./features/auth/login.page').then((m) => m.LoginPageComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./shared/backoffice-shell.component').then(
        (m) => m.BackofficeShellComponent,
      ),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/home/role-home.page').then(
            (m) => m.RoleHomePageComponent,
          ),
        data: { breadcrumb: 'Home', breadcrumbVisible: false },
      },
      {
        path: 'areas',
        loadComponent: () =>
          import('./features/areas/area-list.page').then(
            (m) => m.AreaListPageComponent,
          ),
        canActivate: [roleGuard],
        data: {
          roles: ['EDITOR'] satisfies AppRole[],
          breadcrumb: 'Areas',
          breadcrumbVisible: false,
        },
      },
      {
        path: 'areas/new',
        loadComponent: () =>
          import('./features/areas/area-form.page').then(
            (m) => m.AreaFormPageComponent,
          ),
        canActivate: [roleGuard],
        data: {
          roles: ['EDITOR'] satisfies AppRole[],
          breadcrumb: [{ label: 'Areas', url: '/areas' }, { label: 'Create area' }],
        },
      },
      {
        path: 'areas/:id',
        loadComponent: () =>
          import('./features/areas/area-detail.page').then(
            (m) => m.AreaDetailPageComponent,
          ),
        canActivate: [roleGuard],
        data: {
          roles: CONTENT_ROLES,
          breadcrumb: [{ label: 'Areas', url: '/areas' }, { label: 'Area details' }],
        },
      },
      {
        path: 'areas/:id/edit',
        loadComponent: () =>
          import('./features/areas/area-form.page').then(
            (m) => m.AreaFormPageComponent,
          ),
        canActivate: [roleGuard],
        data: {
          roles: ['EDITOR'] satisfies AppRole[],
          breadcrumb: [{ label: 'Areas', url: '/areas' }, { label: 'Edit area' }],
        },
      },
      {
        path: 'processes',
        loadComponent: () =>
          import('./features/processes/process-list.page').then(
            (m) => m.ProcessListPageComponent,
          ),
        canActivate: [roleGuard],
        data: { roles: CONTENT_ROLES, breadcrumb: 'Processes', breadcrumbVisible: false },
      },
      {
        path: 'processes/new',
        loadComponent: () =>
          import('./features/processes/process-form.page').then(
            (m) => m.ProcessFormPageComponent,
          ),
        canActivate: [roleGuard],
        data: {
          roles: ['EDITOR'] satisfies AppRole[],
          breadcrumb: [{ label: 'Processes', url: '/processes' }, { label: 'Create process' }],
        },
      },
      {
        path: 'processes/:id/edit',
        loadComponent: () =>
          import('./features/processes/process-form.page').then(
            (m) => m.ProcessFormPageComponent,
          ),
        canActivate: [roleGuard],
        data: {
          roles: ['EDITOR'] satisfies AppRole[],
          breadcrumb: [{ label: 'Processes', url: '/processes' }, { label: 'Edit process' }],
        },
      },
      {
        path: 'processes/:id/versions',
        loadComponent: () =>
          import('./features/processes/process-versions.page').then(
            (m) => m.ProcessVersionsPageComponent,
          ),
        canActivate: [roleGuard],
        data: {
          roles: CONTENT_ROLES,
          breadcrumb: [{ label: 'Processes', url: '/processes' }, { label: 'Versions' }],
        },
      },
      {
        path: 'procedures',
        loadComponent: () =>
          import('./features/procedures/procedure-list.page').then(
            (m) => m.ProcedureListPageComponent,
          ),
        canActivate: [roleGuard],
        data: { roles: CONTENT_ROLES, breadcrumb: 'Procedures', breadcrumbVisible: false },
      },
      {
        path: 'processes/:id/versions/new',
        loadComponent: () =>
          import('./features/versions/version-form.page').then(
            (m) => m.VersionFormPageComponent,
          ),
        canActivate: [roleGuard],
        data: {
          roles: ['EDITOR'] satisfies AppRole[],
          breadcrumb: [
            { label: 'Processes', url: '/processes' },
            { label: 'Versions' },
            { label: 'Create version' },
          ],
        },
      },
      {
        path: 'versions/:id',
        loadComponent: () =>
          import('./features/versions/version-detail.page').then(
            (m) => m.VersionDetailPageComponent,
          ),
        canActivate: [roleGuard],
        data: {
          roles: CONTENT_ROLES,
          breadcrumb: [{ label: 'Processes', url: '/processes' }, { label: 'Version detail' }],
        },
      },
      {
        path: 'glossary',
        loadComponent: () =>
          import('./features/glossary/glossary.page').then(
            (m) => m.GlossaryPageComponent,
          ),
        canActivate: [roleGuard],
        data: { roles: CONTENT_ROLES, breadcrumb: 'Glossary', breadcrumbVisible: false },
      },
      {
        path: 'glossary/new',
        loadComponent: () =>
          import('./features/glossary/glossary-form.page').then(
            (m) => m.GlossaryFormPageComponent,
          ),
        canActivate: [roleGuard],
        data: {
          roles: ['EDITOR'] satisfies AppRole[],
          breadcrumb: [{ label: 'Glossary', url: '/glossary' }, { label: 'Create term' }],
        },
      },
      {
        path: 'glossary/:id/edit',
        loadComponent: () =>
          import('./features/glossary/glossary-form.page').then(
            (m) => m.GlossaryFormPageComponent,
          ),
        canActivate: [roleGuard],
        data: {
          roles: ['EDITOR'] satisfies AppRole[],
          breadcrumb: [{ label: 'Glossary', url: '/glossary' }, { label: 'Edit term' }],
        },
      },
      {
        path: 'admin/users',
        loadComponent: () =>
          import('./features/admin/user-list.page').then(
            (m) => m.UserListPageComponent,
          ),
        canActivate: [roleGuard],
        data: {
          roles: ['SYSTEM_ADMIN'] satisfies AppRole[],
          breadcrumb: [{ label: 'Admin' }, { label: 'Users' }],
          breadcrumbVisible: false,
        },
      },
      {
        path: 'admin/teams',
        loadComponent: () =>
          import('./features/admin/team-list.page').then(
            (m) => m.TeamListPageComponent,
          ),
        canActivate: [roleGuard],
        data: {
          roles: ['SYSTEM_ADMIN'] satisfies AppRole[],
          breadcrumb: [{ label: 'Admin' }, { label: 'Teams' }],
          breadcrumbVisible: false,
        },
      },
      {
        path: 'admin/teams/new',
        loadComponent: () =>
          import('./features/admin/team-form.page').then(
            (m) => m.TeamFormPageComponent,
          ),
        canActivate: [roleGuard],
        data: {
          roles: ['SYSTEM_ADMIN'] satisfies AppRole[],
          breadcrumb: [
            { label: 'Admin' },
            { label: 'Teams', url: '/admin/teams' },
            { label: 'Create team' },
          ],
        },
      },
      {
        path: 'admin/teams/:id/edit',
        loadComponent: () =>
          import('./features/admin/team-form.page').then(
            (m) => m.TeamFormPageComponent,
          ),
        canActivate: [roleGuard],
        data: {
          roles: ['SYSTEM_ADMIN'] satisfies AppRole[],
          breadcrumb: [
            { label: 'Admin' },
            { label: 'Teams', url: '/admin/teams' },
            { label: 'Edit team' },
          ],
        },
      },
      {
        path: 'admin/users/new',
        loadComponent: () =>
          import('./features/admin/user-form.page').then(
            (m) => m.UserFormPageComponent,
          ),
        canActivate: [roleGuard],
        data: {
          roles: ['SYSTEM_ADMIN'] satisfies AppRole[],
          breadcrumb: [
            { label: 'Admin' },
            { label: 'Users', url: '/admin/users' },
            { label: 'Create user' },
          ],
        },
      },
      {
        path: 'admin/users/:id/edit',
        loadComponent: () =>
          import('./features/admin/user-form.page').then(
            (m) => m.UserFormPageComponent,
          ),
        canActivate: [roleGuard],
        data: {
          roles: ['SYSTEM_ADMIN'] satisfies AppRole[],
          breadcrumb: [
            { label: 'Admin' },
            { label: 'Users', url: '/admin/users' },
            { label: 'Edit user' },
          ],
        },
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
