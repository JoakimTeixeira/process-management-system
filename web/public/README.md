# Public Portal

Angular public portal for browsing the published process repository.

## Main Features

- Published process catalog
- Process detail view with architecture-state navigation
- BPMN diagram viewing
- Procedure viewing
- Search across published content
- Glossary and informational pages

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
- the public entrypoint is `http://localhost:8080`

The containerized public URL stays stable even if `web-public` is scaled to multiple replicas.
