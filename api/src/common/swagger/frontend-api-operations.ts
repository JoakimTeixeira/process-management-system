type FrontendApiOperation = {
  method: 'get' | 'post' | 'patch' | 'delete';
  path: string;
  responseKind: 'json' | 'text' | 'none';
};

export const FRONTEND_API_OPERATIONS = [
  { method: 'post', path: '/auth/login', responseKind: 'json' },
  { method: 'get', path: '/auth/me', responseKind: 'json' },
  { method: 'get', path: '/itil-practices', responseKind: 'json' },
  { method: 'get', path: '/areas', responseKind: 'json' },
  { method: 'get', path: '/areas/{id}', responseKind: 'json' },
  { method: 'post', path: '/areas', responseKind: 'json' },
  { method: 'patch', path: '/areas/{id}', responseKind: 'json' },
  { method: 'delete', path: '/areas/{id}', responseKind: 'none' },
  { method: 'get', path: '/processes', responseKind: 'json' },
  { method: 'get', path: '/processes/{id}', responseKind: 'json' },
  { method: 'post', path: '/processes', responseKind: 'json' },
  { method: 'patch', path: '/processes/{id}', responseKind: 'json' },
  { method: 'delete', path: '/processes/{id}', responseKind: 'none' },
  {
    method: 'get',
    path: '/processes/{processId}/versions',
    responseKind: 'json',
  },
  {
    method: 'post',
    path: '/processes/{processId}/versions',
    responseKind: 'json',
  },
  { method: 'get', path: '/process-versions/{id}', responseKind: 'json' },
  { method: 'patch', path: '/process-versions/{id}', responseKind: 'json' },
  {
    method: 'post',
    path: '/process-versions/{id}/submit-for-review',
    responseKind: 'json',
  },
  {
    method: 'post',
    path: '/process-versions/{id}/approve',
    responseKind: 'json',
  },
  {
    method: 'post',
    path: '/process-versions/{id}/reject',
    responseKind: 'json',
  },
  {
    method: 'post',
    path: '/process-versions/{id}/reopen',
    responseKind: 'json',
  },
  {
    method: 'post',
    path: '/process-versions/{id}/publish',
    responseKind: 'json',
  },
  {
    method: 'post',
    path: '/process-versions/{id}/archive',
    responseKind: 'json',
  },
  {
    method: 'post',
    path: '/process-versions/{id}/promote',
    responseKind: 'json',
  },
  {
    method: 'get',
    path: '/process-versions/{processVersionId}/assets',
    responseKind: 'json',
  },
  {
    method: 'get',
    path: '/process-versions/{processVersionId}/procedures',
    responseKind: 'json',
  },
  {
    method: 'post',
    path: '/process-versions/{processVersionId}/procedures',
    responseKind: 'json',
  },
  { method: 'patch', path: '/procedures/{id}', responseKind: 'json' },
  { method: 'get', path: '/procedures', responseKind: 'json' },
  {
    method: 'post',
    path: '/process-versions/{processVersionId}/assets/bpmn',
    responseKind: 'json',
  },
  {
    method: 'get',
    path: '/process-versions/{processVersionId}/assets/{assetId}/content',
    responseKind: 'json',
  },
  {
    method: 'get',
    path: '/process-versions/{processVersionId}/state-history',
    responseKind: 'json',
  },
  {
    method: 'get',
    path: '/audit-logs/{entityType}/{entityId}',
    responseKind: 'json',
  },
  { method: 'get', path: '/public/glossary', responseKind: 'json' },
  { method: 'post', path: '/glossary', responseKind: 'json' },
  { method: 'patch', path: '/glossary/{id}', responseKind: 'json' },
  {
    method: 'get',
    path: '/users/owner-options/team/{id}',
    responseKind: 'json',
  },
  { method: 'get', path: '/users', responseKind: 'json' },
  { method: 'get', path: '/users/{id}', responseKind: 'json' },
  { method: 'get', path: '/users/team-options', responseKind: 'json' },
  { method: 'get', path: '/teams', responseKind: 'json' },
  { method: 'get', path: '/teams/{id}', responseKind: 'json' },
  { method: 'post', path: '/teams', responseKind: 'json' },
  { method: 'patch', path: '/teams/{id}', responseKind: 'json' },
  { method: 'patch', path: '/teams/{id}/deactivate', responseKind: 'json' },
  { method: 'post', path: '/users', responseKind: 'json' },
  { method: 'patch', path: '/users/{id}', responseKind: 'json' },
  { method: 'patch', path: '/users/{id}/deactivate', responseKind: 'json' },
  { method: 'patch', path: '/users/{id}/reset-password', responseKind: 'json' },
  { method: 'get', path: '/public/areas', responseKind: 'json' },
  { method: 'get', path: '/public/processes', responseKind: 'json' },
  { method: 'get', path: '/public/procedures', responseKind: 'json' },
  { method: 'get', path: '/public/search', responseKind: 'json' },
  {
    method: 'get',
    path: '/public/processes/{processId}',
    responseKind: 'json',
  },
  {
    method: 'get',
    path: '/public/processes/{processId}/versions',
    responseKind: 'json',
  },
  {
    method: 'get',
    path: '/public/process-versions/{id}/bpmn',
    responseKind: 'text',
  },
  {
    method: 'get',
    path: '/public/procedures/{id}',
    responseKind: 'json',
  },
] as const satisfies readonly FrontendApiOperation[];
