# Backoffice

Angular backoffice for authenticated governance and administration.

## Main Features

- Login and protected routing
- User and team administration
- Area, process, version, and procedure management
- BPMN asset upload and viewing
- Version governance actions and history review

## Local Development

Install dependencies:

```bash
npm install
```

Start the Angular dev server:

```bash
npm start
```

Build:

```bash
npm run build
```

Run headless tests:

```bash
npm run test:headless
```

## API Integration

During direct local development, the app talks to `http://localhost:3000`.

Inside Docker:

- the Angular app runs behind Nginx
- `/api/*` is proxied to `api-lb`
- the public entrypoint is `http://localhost:8081`

The containerized backoffice URL stays stable even if `web-backoffice` is scaled to multiple replicas.
