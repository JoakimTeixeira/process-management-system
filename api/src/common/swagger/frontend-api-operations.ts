type HttpMethod = 'get' | 'post' | 'patch' | 'delete';
type ResponseKind = 'json' | 'text' | 'none';

type FrontendApiOperation = {
  method: HttpMethod;
  path: string;
  responseKind: ResponseKind;
};

const OPERATION_SPECS = `
post /auth/login
get /auth/me
get /itil-practices
get /areas
get /areas/{id}
post /areas
patch /areas/{id}
delete /areas/{id} none
get /processes
get /processes/{id}
post /processes
patch /processes/{id}
delete /processes/{id} none
get /processes/{processId}/versions
post /processes/{processId}/versions
get /process-versions/{id}
patch /process-versions/{id}
post /process-versions/{id}/submit-for-review
post /process-versions/{id}/approve
post /process-versions/{id}/reject
post /process-versions/{id}/reopen
post /process-versions/{id}/publish
post /process-versions/{id}/archive
post /process-versions/{id}/promote
get /process-versions/{processVersionId}/assets
get /process-versions/{processVersionId}/procedures
post /process-versions/{processVersionId}/procedures
patch /procedures/{id}
get /procedures
post /process-versions/{processVersionId}/assets/bpmn
get /process-versions/{processVersionId}/assets/{assetId}/content
get /process-versions/{processVersionId}/state-history
get /audit-logs/{entityType}/{entityId}
get /public/glossary
post /glossary
patch /glossary/{id}
get /users/owner-options/team/{id}
get /users
get /users/{id}
get /users/team-options
get /teams
get /teams/{id}
post /teams
patch /teams/{id}
patch /teams/{id}/deactivate
post /users
patch /users/{id}
patch /users/{id}/deactivate
patch /users/{id}/reset-password
get /public/areas
get /public/processes
get /public/procedures
get /public/search
get /public/processes/{processId}
get /public/processes/{processId}/versions
get /public/process-versions/{id}/bpmn text
get /public/procedures/{id}
`;

export const FRONTEND_API_OPERATIONS: readonly FrontendApiOperation[] =
  OPERATION_SPECS.trim()
    .split('\n')
    .map((line) => {
      const [method, path, responseKind = 'json'] = line.trim().split(' ') as [
        HttpMethod,
        string,
        ResponseKind?,
      ];
      return {
        method,
        path,
        responseKind,
      };
    });
