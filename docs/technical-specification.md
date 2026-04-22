# Technical Specification

This document defines the complete technical implementation requirements and UI/UX design decisions for the system, aligned with the intended database schema, authentication system, and API architecture.

These specifications cover:

- **TA-TG** → Backend API technical requirements (asset management, database transactions, authentication, error handling, API design)
- **TH-TM** → Frontend UI/UX technical requirements (routing, environment config, notifications, data transformation, navigation)
- **TN** → Technical architecture decisions and justifications

These are implementation standards that should be enforced in code and validated by both unit and integration tests. They complement the business rules document by defining HOW the system is built, while business rules define WHAT the system must enforce.

---

# TA. Asset Management

## TA1

Empty files must be rejected during asset upload.

**Rationale**: Prevents storage of invalid/corrupted uploads and reduces confusion from users accidentally submitting empty templates.

**Implementation**: Check `file.size` or `buffer.length === 0` before processing. Return `400 Bad Request` with message "Empty files are not allowed".

## TA2

A checksum must be computed and stored for all uploaded assets to ensure file integrity.

**Rationale**: Detects data corruption during transmission or storage, ensuring BPMN diagrams remain valid for process execution.

**Implementation**: Use SHA-256 or similar cryptographic hash. Store checksum in `assets.checksum` column. Validate on retrieval to detect corruption.

## TA3

BPMN files uploaded with `application/octet-stream` must be normalized to `application/xml` for consistent metadata.

**Rationale**: Some browsers/upload clients default to generic MIME types. Normalization ensures consistent API behavior and correct content-type headers when serving files.

**Implementation**: Check if `mimetype` is falsy or equals `'application/octet-stream'`. If so, normalize to `'application/xml'`. Otherwise, use the provided mimeType (trimmed and lowercased).

## TA4

BPMN assets must be stored in the `backoffice/bpmn/` directory with generated file paths.

**Rationale**: Organized directory structure prevents filename collisions, enables easy backup of process assets, and separates BPMN files from other asset types for potential future migration to object storage.

**Implementation**: File path format: `backoffice/bpmn/{processVersionId}-{uuid}{extension}`. Extension is `.bpmn` or `.xml` based on original filename. Uses UUID (not timestamp) to ensure uniqueness.

## TA5

Asset revisions must be ordered by creation date (newest first) for display.

**Rationale**: Users need to see the most recent version first to understand current state. Chronological ordering provides clear progression history for audit purposes.

**Implementation**: Query with `ORDER BY created_at DESC`. The `is_current` flag indicates the active revision for normal display.

## TA6

Asset revisions must be labeled sequentially (v1, v2, etc.) based on their position in the timeline.

**Rationale**: Simple sequential labels (v1, v2) are more user-friendly than raw timestamps or UUIDs, making it easy to reference specific versions in discussions.

**Implementation**: After querying revisions ordered by date, map each to display label `v{index + 1}` where index is position in array (0 = v1, 1 = v2).

---

# TB. Database and Transaction Management

## TB1

Critical operations such as promote must use row-level locking (`FOR UPDATE`) to prevent concurrent modifications.

**Rationale**: Promotion involves multiple steps (archive AS-IS, create new AS-IS, archive TO-BE). Without locking, concurrent requests could create multiple published AS-IS versions, violating business rule F7.

**Implementation**: Use TypeORM's `.setLock('pessimistic_write')` or raw SQL `SELECT ... FOR UPDATE`. Lock the `process_versions` row before checking state and executing promotion to prevent race conditions.

## TB2

Multi-step operations must execute within database transactions to ensure atomicity.

**Rationale**: Prevents partial state corruption where some steps succeed and others fail. If promotion fails mid-way, we don't want orphaned versions or inconsistent archive states.

**Implementation**: Use `@Transactional()` decorator or `dataSource.transaction()` callback. All database operations within the transaction block must succeed or all roll back. This applies to promotion (archive AS-IS, create new AS-IS, archive TO-BE) and version creation with initial procedure.

## TB3

Audit log failures must propagate errors to ensure audit trail integrity.

**Rationale**: Audit trails are required for governance visibility and accountability (business rule J1-J12). Silent audit failures would create unlogged actions, breaking accountability.

**Implementation**: Audit service should throw errors that bubble up to the controller. Do not catch and suppress audit errors in the business logic layer. If audit write fails, the entire operation should fail.

---

# TC. User Authentication

## TC1

Passwords must meet minimum complexity requirements:

- At least 15 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

**Rationale**: This is a governance system handling critical business processes. Strong passwords protect against brute force attacks given the sensitive nature of workflow definitions and approvals.

**Implementation**: Use `@MinLength(15)` and `@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/)` in DTO. Pattern uses positive lookahead assertions for each character class.

## TC2

Passwords must be hashed with a pepper value stored in environment configuration.

**Rationale**: Even if the database is compromised, passwords remain uncrackable without the application-level pepper secret, requiring attacker to compromise both database AND application server.

**Implementation**: Pass pepper as `secret` option to Argon2 (not concatenation). Pepper is a global secret stored in `PASSWORD_PEPPER` env var. Argon2 uses this as a keyed hash (HMAC-style), different from per-user salt - provides defense-in-depth against rainbow table attacks even if database is breached.

## TC3

JWT tokens must support configurable expiration with format: `Ns`, `Nm`, `Nh`, `Nd` (seconds, minutes, hours, days).

**Rationale**: Different environments have different security requirements. Production may use short expiration (15m), while development may use longer (1h) to reduce token refresh overhead during testing.

**Implementation**: Parse format with regex `/^(\d+)([smhd])$/`. Convert to seconds: `s` ×1, `m` ×60, `h` ×3600, `d` ×86400. Store computed `jwtExpiresInSeconds` in auth config for use in token generation.

## TC4

JWT payload must contain minimal claims:

- `sub` - user ID
- `email` - user email

**Rationale**: Smaller JWT size reduces header overhead on every request. Role/team changes require token refresh if embedded; minimal claims ensure current permissions are always fetched from database.

**Implementation**: Do not include role, team, or other attributes in JWT to keep token small and prevent stale data issues. Fetch full user details from database on each request using `sub` claim.

## TC5

Passwords must be hashed using Argon2 algorithm with a pepper value.

**Rationale**: Argon2 won the Password Hashing Competition (2015) and is the modern standard. Uses default Argon2id variant (recommended by OWASP) which provides resistance against both GPU cracking and side-channel attacks.

**Implementation**: Use `argon2.hash(password, { secret: Buffer.from(pepper, 'utf8') })`. The `secret` option creates a keyed hash (HMAC-style). Verify with `argon2.verify(hash, password, { secret: Buffer.from(pepper, 'utf8') })`. Default Argon2id type is used (no explicit type option needed).

---

# TD. Public Portal UI/UX

## TD1

Blank or whitespace-only search terms must return empty results without querying the database.

**Rationale**: Empty search typically indicates user hesitation or accidental submission. Querying the database would return all results (or cause performance issues), which isn't what users expect from an empty search.

**Implementation**: Check `search.trim().length === 0` before calling repository. Return empty array `[]` immediately without database round-trip. Prevents unnecessary load and matches user expectation that blank search = no results.

## TD2

Search terms must be trimmed of leading and trailing whitespace before executing queries.

**Rationale**: Users often copy-paste search terms with surrounding spaces. Without trimming, "Change " (with space) won't match "Change Management", causing frustrating false negatives.

**Implementation**: Use `search.trim()` on frontend before API call, and again on backend before repository query. Prevents leading/trailing spaces from affecting fuzzy matching algorithms.

---

# TE. Entity Code Generation

## TE1

Area codes must be automatically generated by the backend using a compact sequential format (e.g., `A1`, `A2`).

**Rationale**: Manual area-code entry creates conflicts and governance noise without adding meaningful business value. A compact generated identifier remains stable, readable, and easy to sort.

**Implementation**: Query the highest existing `A{n}` code, increment its numeric suffix, and persist the next value as a string. Enforce uniqueness at the database level and reject any client attempt to modify the generated code later.

## TE2

Procedure codes must be automatically generated by the backend using a dotted hierarchical format.

The code must combine the parent Process code with the next sequential sub-level identifier.

This ensures mathematical enforcement of the Area > Process > Procedure taxonomy.

## TE3

Process codes must be automatically generated by the backend using sequential numbering.

**Rationale**: Sequential numbering (1, 2, 3) is concise for URLs and API calls while maintaining sortability. User-defined codes often lead to conflicts and require manual uniqueness checking.

**Implementation**: Use database sequence or query `MAX(CAST(code AS INTEGER)) + 1`. Format as string with optional padding. Handle race conditions with unique constraint retry logic.

## TE4

Generated codes must remain stable and continuous within their entity scope and must not be user-modifiable.

**Rationale**: Codes appear in URLs, bookmarks, and external references. Changing codes would break existing links. Immutability ensures stable URLs and prevents accidental breaking of shared references.

**Implementation**: Exclude `code` from allowed update DTO fields. Return `400 Bad Request` if client attempts to modify code. Codes are immutable for life of entity to maintain referential integrity in URLs and references.

---

# TF. Error Handling

## TF1

Repository errors must be propagated to the service layer for proper handling.

**Rationale**: Repository layer should focus on data access, not HTTP semantics. Service layer has context to translate technical errors (unique constraint violation) to business-friendly messages ("Process code already exists").

**Implementation**: Do not catch generic errors in repositories. Let PostgreSQL errors (unique constraint violations, foreign key failures) bubble up to service layer where they can be translated to appropriate HTTP exceptions (409 Conflict, 400 Bad Request).

## TF2

Validation errors must provide clear, actionable messages to users.

**Rationale**: Generic "Validation failed" messages frustrate users. Specific guidance ("Password must contain at least one uppercase letter") enables self-service correction without support tickets.

**Implementation**: Use NestJS `ValidationPipe` with `whitelist`, `forbidNonWhitelisted`, and `transform` enabled. The implementation should rely on NestJS's standard class-validator error structure rather than a custom `exceptionFactory`.

## TF3

Missing entity references (users, teams, processes, versions) must trigger NotFoundException with appropriate messaging.

**Rationale**: Attempting operations on non-existent entities indicates broken client state or stale data. Early failure with clear message is better than late undefined reference errors in business logic.

**Implementation**: Check repository result for `null` immediately after query. Throw `NotFoundException(entityType + ' with id ' + id + ' not found')` before any business logic. Prevents cryptic "cannot read property of null" errors later.

---

# TG. API Design

## TG1

API responses must use consistent field naming conventions (camelCase for JSON).

**Rationale**: JavaScript/TypeScript convention is camelCase. Consistent naming reduces bugs from case mismatches and follows industry standards for JSON APIs.

**Implementation**: Use `class-transformer` `@Expose({ name: 'camelCase' })` or global interceptor to transform all responses. Database snake_case should never leak to clients.

## TG2

Database column names (snake_case) must be mapped to camelCase in API responses.

**Rationale**: PostgreSQL convention is snake_case, but JavaScript uses camelCase. Mapping layer bridges this gap without forcing either side to use non-idiomatic naming.

**Implementation**: Use TypeORM `name: 'snake_case'` in entity decorators combined with response DTOs that expose camelCase. Never return raw entity objects directly from controllers.

## TG3

List endpoints must support filtering and deterministic ordering where applicable.

**Rationale**: Process catalogs may contain many entries, so users need narrowing controls and predictable result order. The documented design does not expose generic pagination or client-selected sorting, so the documentation should not imply those capabilities.

**Implementation**: Public catalog endpoints should accept only the documented filters, such as `search`, `areaId`, and `architectures`. Repository queries should apply fixed ordering such as `code ASC` for listings and relevance-first ordering for search results. Generic `limit`/`offset`, `page`, or public `order` parameters should not be part of the public API.

## TG4

Date and timestamp fields must use ISO 8601 format in API responses.

**Rationale**: ISO 8601 is the universal standard for date interchange. Explicit timezone (Z for UTC) eliminates ambiguity across different client timezones and enables reliable parsing in any programming language.

**Implementation**: Use `toISOString()` for Date objects. Format: `2026-04-28T12:00:00.000Z`. Store in PostgreSQL `TIMESTAMP WITH TIME ZONE`. Always return UTC to clients.

## TG5

API update endpoints must support partial updates (PATCH semantics), accepting only changed fields.

**Rationale**: Full entity updates require frontend to maintain complete state, increasing complexity and bandwidth. Partial updates reduce payload size and prevent accidental overwrites of unchanged data.

**Implementation**: Use `PartialType()` from `@nestjs/swagger` for update DTOs. In service, merge provided fields with existing entity using `{ ...existing, ...changed }`. Only send changed fields from frontend to minimize payload.

## TG6

Controllers must be decorated with `@Roles` metadata to enforce authorization at both class and method levels.

**Rationale**: Declarative authorization is self-documenting and can be introspected for API documentation. Centralizing role checks in guards reduces code duplication and prevents inconsistent authorization logic.

**Implementation**: Apply `@Roles()` decorator to controller class for default access, and to individual methods for overrides. Use `@nestjs/core` `Reflector` in `RolesGuard` to read metadata at runtime. Combine with `@UseGuards(JwtAuthGuard, RolesGuard)` on controller.

## TG7

API bootstrap must apply a global validation and serialization pipeline.

**Rationale**: Consistent validation and serialization at the application boundary reduces per-controller boilerplate and prevents drift between modules.

**Implementation**: Configure global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` and `ClassSerializerInterceptor` during NestJS bootstrap so all modules inherit the same request and response policy.

## TG8

Non-production CORS must be limited to local development origins only.

**Rationale**: Local Angular dev servers need browser access to the API, but broad CORS in deployed environments would widen the attack surface without supporting the intended runtime model.

**Implementation**: Enable CORS only outside production and allow requests only when the parsed `Origin` hostname is `localhost` or `127.0.0.1`. Requests without an origin header remain allowed for tooling and same-environment access.

## TG9

Swagger documentation must be generated from the active application modules and preserve bearer authorization during manual testing.

**Rationale**: Protected endpoint verification is much easier when the documentation UI retains the current JWT during exploratory testing.

**Implementation**: Build the Swagger document from the loaded feature modules with deep route scanning enabled, register bearer authentication, and configure the docs UI with `persistAuthorization: true`.

## TG10

Method-level `@Roles` metadata must override class-level metadata for fine-grained access control.

**Rationale**: Most controller methods share a default access level (e.g., all require EDITOR), but specific methods may differ (e.g., list requires VIEWER). Override capability avoids repetitive annotations.

**Implementation**: In `RolesGuard.canActivate()`, check method metadata first with `reflector.get(ROLES_KEY, context.getHandler())`. If undefined, fall back to class metadata with `reflector.get(ROLES_KEY, context.getClass())`. This allows class default with method exceptions.

---

# TH. Routing Conventions

## TH1

Process tab routes must follow the pattern: `/catalog/processes/{processId}/{tabId}`

Default tab (overview) must use the base path without tab suffix.

**Rationale**: RESTful URL structure makes routes predictable and bookmarkable. Tab state in URL enables browser refresh without losing context and allows direct linking to specific process views.

**Implementation**: Use explicit sibling Angular routes for `/catalog/processes/:processId` and `/catalog/processes/:processId/{tabId}`, all targeting the same detail component and using route metadata to resolve the active tab. The base path acts as the default overview entrypoint, while explicit tab routes remain directly linkable.

## TH2

Architecture state values must be converted to lowercase kebab-case for URL segments:

- `AS-IS` → `as-is`
- `TO-BE` → `to-be`

**Rationale**: Special characters in URLs require encoding and look ugly. Kebab-case (`as-is`) is readable, SEO-friendly, and doesn't require percent-encoding unlike `AS-IS` (which would be `AS%2DIS`).

**Implementation**: Use `value.toLowerCase().replace(/_/g, '-')` transformation. Parse URL back to enum with reverse transformation. This makes URLs readable and SEO-friendly.

## TH3

Tab indices must be mapped consistently:

- Index 0 → default/overview
- Index 1 → diagram
- Index 2 → procedures
- Index 3 → history
- Index 4 → compare

**Rationale**: Consistent ordering across all process pages enables muscle memory for users. Array index mapping allows efficient Material Tab integration while maintaining URL synchronization.

**Implementation**: Use array of tab definitions with `id`, `label`, `icon` properties. Matched tab index drives both UI tab selection and URL state. Bidirectional mapping functions convert between URL tab ID and array index.

---

# TI. Environment Configuration

## TI1

Environment variables must be validated at application startup.

Required variables must include:

- Database connection parameters (host, port, username, password, name)
- Authentication secrets (JWT secret, password pepper)

**Rationale**: Fail-fast approach prevents deployment of misconfigured applications. Missing database credentials or JWT secrets would cause cryptic runtime errors later; early validation provides clear actionable messages.

**Implementation**: Use `class-validator` with `@IsString()`, `@IsNumber()` decorators on a config class. Call `validate()` on bootstrap. Throw `Error` with descriptive message listing missing/invalid variables.

## TI2

Optional environment variables must have sensible defaults:

- `NODE_ENV` defaults to `development`
- `PORT` defaults to `3000`
- `DB_PORT` defaults to `5432`
- `DB_SSL` defaults to `false`

**Rationale**: Sensible defaults enable "clone and run" for new developers without extensive environment setup. Reduces friction for local development while still allowing override for production/staging environments.

**Implementation**: Use `process.env.VAR || defaultValue` pattern in config factory functions. Document all defaults in `.env.example` file for reference.

The root environment template should include:

- `NODE_ENV`
- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_SSL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `PASSWORD_PEPPER`
- `DEMO_PASSWORD`

## TI3

Invalid environment configurations must throw descriptive errors at startup.

**Rationale**: Descriptive error messages reduce debugging time during deployments. Process exit code 1 signals failure to orchestration tools (Docker, Kubernetes) to prevent rollout of broken instances.

**Implementation**: Validate before NestJS app creation. Format: `Missing required environment variables: DB_HOST, JWT_SECRET`. Exit process with code 1 to prevent deployment of misconfigured instances.

## TI4

Validated environment configuration must be cached for performance.

**Rationale**: Environment variables don't change during runtime. Repeatedly re-parsing and re-validating on every service injection adds unnecessary overhead. Caching improves request latency.

**Implementation**: Store validated config in module-scoped variable. Return same object on subsequent `getValidatedEnvironment()` calls. Prevents re-parsing env vars on every config injection.

## TI5

Frontend clients must resolve the API base URL dynamically from the runtime context.

**Rationale**: The same frontend codebase must work both behind Docker-served Nginx entrypoints and in standalone Angular development servers without hand-editing environment files for every execution mode.

**Implementation**: When the frontend runs behind Docker entrypoints on `localhost:8080` or `localhost:8081`, or on any non-local host, use `/api` so Nginx proxies requests to the backend. When Angular runs on another local development port, call `http://localhost:3000`. When already hosted on `localhost:3000`, use an empty prefix.

---

# TJ. Database Configuration

## TJ1

Database connections must use PostgreSQL as the underlying engine.

**Rationale**: PostgreSQL provides ACID compliance, strong consistency, and mature tooling suitable for governance-focused data. Native JSONB support enables flexible procedure storage without schema migrations.

**Implementation**: TypeORM `type: 'postgres'`. Use `pg` driver. Connection pooling with default settings or `extra: { max: 20 }` for production tuning.

## TJ2

Database SSL mode must be configurable via environment variable.

When SSL is enabled, `rejectUnauthorized` is set to `false` to allow self-signed certificates.

**Rationale**: Production requires SSL encryption for data protection. Self-signed certificates are common in Docker and cloud environments where managed certificates aren't available. This configuration prioritizes encryption over strict CA verification (acceptable for internal networks).

**Implementation**: `ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false`. When `DB_SSL=true`, enables SSL with `rejectUnauthorized: false`. When `DB_SSL=false`, SSL is disabled entirely.

## TJ3

Database migrations must be stored in a dedicated `migrations` table.

**Rationale**: Migration tracking ensures schema changes are applied exactly once across all environments. Prevents inconsistencies where some servers have different schema versions than others.

**Implementation**: TypeORM automatically creates `migrations` table with `id`, `timestamp`, `name` columns. Each migration file execution is recorded to prevent re-running.

## TJ4

Entity synchronization (`synchronize: true`) must be disabled in production.

**Rationale**: Auto-synchronization is dangerous in production - it drops columns that no longer exist in entities, causing data loss. Explicit migrations provide review, testing, and rollback capabilities.

**Implementation**: `synchronize: process.env.NODE_ENV !== 'production'`. Auto-sync drops columns/data in production. Always use explicit migrations for schema changes in prod.

## TJ5

Migrations must not auto-run (`migrationsRun: false`) to allow controlled deployment.

**Rationale**: Auto-running migrations on application startup risks applying changes during high-traffic periods or before backups complete. Manual control enables scheduled maintenance windows and immediate rollback if issues occur.

**Implementation**: Set `migrationsRun: false` in TypeORM config. Run migrations manually via CLI `typeorm migration:run` during deployment. Allows rollback planning and verification before schema changes.

## TJ6

The Docker deployment must expose the application tier through dedicated load balancer services while keeping the application containers internal.

**Rationale**: This allows `api`, `web-public`, and `web-backoffice` to scale horizontally without changing the public URLs. It also keeps the public entrypoints stable across environments and deployments.

**Implementation**: Use `api-lb`, `public-lb`, and `backoffice-lb` as Nginx-based public entrypoints on ports `3000`, `8080`, and `8081`. The backend and frontend services use Docker-internal service exposure rather than direct host port bindings.

---

# TK. UI Notifications

## TK1

Success toast notifications must be displayed after successful create, update, and delete operations.

**Rationale**: Users need confirmation that their actions succeeded, especially for operations that don't immediately change the page (like saving a form). Without feedback, users may repeatedly submit or assume failure.

**Implementation**: Use Angular Material `MatSnackBar` or custom toast service. Call `toast.success('Entity created successfully')` after API success. Auto-dismiss after 3-5 seconds with success styling (green checkmark).

## TK2

Error toast notifications must be displayed when operations fail.

**Rationale**: Silent failures leave users confused about why their action didn't work. Explicit error messages with dismiss requirement ensure users acknowledge and understand the failure before proceeding.

**Implementation**: Catch API errors in component/service. Call `toast.error(error.message || 'Operation failed')`. Display in red styling with error icon. Require user dismissal for errors (no auto-hide) to ensure visibility.

---

# TL. Data Transformation

## TL1

Email addresses must be normalized (trimmed and lowercased) before storage and validation.

**Rationale**: Email addresses are case-insensitive per RFC 5321. Without normalization, the same person could create multiple accounts (`John@Example.com`, `john@example.com`) causing data fragmentation and authentication confusion.

**Implementation**: Use `@Transform(({ value }) => value?.trim().toLowerCase())` in DTO. Applied before `@IsEmail()` validation. Prevents duplicate accounts for `User@example.com` vs `user@example.com`.

## TL2

Role names must be normalized (trimmed and uppercased) before storage and validation.

**Rationale**: Role enums are defined in uppercase (`EDITOR`, `VIEWER`). Case mismatches (`editor` vs `EDITOR`) would fail enum validation. Normalization ensures consistent comparison regardless of user input casing.

**Implementation**: Use `@Transform(({ value }) => value?.trim().toUpperCase())` in DTO. Applied before `@IsEnum(Role)` validation. Ensures consistent casing for role comparisons.

## TL3

API response data must be mapped to UI models to separate current state, target state, and comparison state.

**Rationale**: Internal API uses AS-IS/TO-BE terminology, but public portal needs business-friendly labels (Current State/Target State). Mapping layer enables UI flexibility without changing backend contracts.

**Implementation**: Use mapper functions like `mapProcessDetailViewModel()` that transform `asIs`/`toBe` API response into `currentState`/`targetState` UI model. Enables business-friendly terminology (Current State/Target State) while maintaining internal AS-IS/TO-BE naming.

## TL4

Glossary API responses must be mapped to separate terms and practices into distinct UI collections.

**Rationale**: Glossary terms and ITIL practices have different attributes and use cases. Separating them in the UI enables different rendering (terms for definitions, practices for process categorization) and clearer information architecture.

**Implementation**: Use `mapGlossaryResponse()` to split combined API response into `terms[]` and `practices[]` arrays. Different rendering and behavior for each collection type in glossary view.

---

# TM. Breadcrumb Navigation

## TM1

Breadcrumbs must be dynamically built based on the current route and entity context.

**Rationale**: Static breadcrumbs don't reflect navigation state (e.g., filtering by area, viewing specific architecture). Dynamic generation ensures breadcrumb trail accurately represents user's path and current context.

**Implementation**: Use `buildProcessBreadcrumbs()`, `buildProcedureBreadcrumbs()`, `buildCatalogBreadcrumbs()` builder functions. Pass entity data and current context. Returns array of `{ label, link?, queryParams? }` objects for rendering.

## TM2

Breadcrumb hierarchy must follow: Home → Collection → Area → Process → (Tab/Procedure)

**Rationale**: This hierarchy mirrors the domain model (Area contains Processes, Process contains Procedures/versions). Users can navigate up any level without losing context.

**Implementation**: Static first breadcrumb is always `{ label: 'Home', link: '/' }`. Area breadcrumb links to filtered process list. Process breadcrumb links to detail with architecture view preserved.

## TM3

Breadcrumb links must include query parameters to preserve context (areaId, view state).

**Rationale**: Without context preservation, clicking "Operations" in breadcrumb would show all processes instead of maintaining the area filter. View state preservation ensures AS-IS/TO-BE selection isn't lost during navigation.

**Implementation**: Include `queryParams: { areaId }` in breadcrumb objects. Angular router handles this automatically when navigating. View state (`as-is`/`to-be`) preserved via `view` query param.

## TM4

Entity breadcrumbs must display both code and title (e.g., "PR-001 - Incident Management").

**Rationale**: Code alone is cryptic for non-technical users; title alone may not be unique. Combined format provides both unambiguous reference (code) and human context (title) for all user types.

**Implementation**: Format: `${code} - ${title}`. If title is long, truncate with ellipsis. Code provides unique identifier, title provides human-readable context.

---

# TN. Architecture Decisions

## TN1

**Decision**: Use NestJS with TypeScript for the backend API.

**Justification**:

- TypeScript provides type safety and better developer experience
- NestJS offers modular architecture with dependency injection
- Built-in support for decorators enables clean metadata-based authorization
- Extensive ecosystem for enterprise applications
- Native support for testing with Jest

## TN2

**Decision**: Use Angular with standalone components for the frontend.

**Justification**:

- Standalone components reduce boilerplate and improve tree-shaking
- Signal-based reactivity provides fine-grained change detection
- TypeScript alignment with backend reduces context switching
- Strong testing framework with Jasmine and TestBed
- Official Google support for long-term stability

## TN3

**Decision**: Use PostgreSQL as the primary database with TypeORM.

**Justification**:

- PostgreSQL provides ACID compliance and strong consistency for governance-focused data
- Native JSONB support for flexible procedure activities storage
- TypeORM offers decorator-based entity mapping aligned with NestJS patterns
- Migration system ensures schema version control
- Row-level locking support for concurrent operations like promotion

## TN4

**Decision**: Use JWT with Argon2 for authentication.

**Justification**:

- JWT enables stateless authentication scalable across multiple instances
- Argon2 is a modern, memory-hard password hashing algorithm resistant to GPU attacks
- Minimal JWT payload (sub, email only) reduces token size and attack surface
- Configurable expiration supports different security requirements
- Pepper value adds defense-in-depth against database breaches

## TN5

**Decision**: Use local filesystem storage for BPMN assets.

**Justification**:

- File sizes are typically small (< 1MB) making filesystem storage efficient
- Avoids external service dependencies (S3, etc.) for simpler deployment and maintenance
- Checksum validation ensures file integrity without cloud storage costs
- Directory structure (`backoffice/bpmn/`) provides organization
- Can be migrated to object storage later without API changes

## TN6

**Decision**: Use compact backend-generated codes (`A{n}`, `{n}`, and `{processCode}.{suffix}`).

**Justification**:

- Backend-generated codes prevent user errors and ensure uniqueness
- Compact area and process identifiers keep URLs and tables easy to scan
- Procedure codes retain visible parent-child lineage through `{processCode}.{suffix}`
- Immutable codes preserve stable references across links and internal records
- Sequential numbering supports predictable ordering in repository queries

## TN7

**Decision**: Use PATCH semantics for updates with partial field acceptance.

**Justification**:

- Reduces payload size by only sending changed fields
- Prevents accidental overwrites of unchanged data
- Simplifies frontend forms by not requiring full entity state
- Enables optimistic updates in UI
- Reduces database write load

## TN8

**Decision**: Use decorator-based RBAC with `@Roles` metadata.

**Justification**:

- Declarative authorization at controller/method level is self-documenting
- Metadata is introspectable for API documentation and testing
- Method-level overrides enable fine-grained access control
- Guard pattern integrates cleanly with NestJS request lifecycle
- Centralized role checking reduces code duplication

## TN9

**Decision**: Use separate audit service with repository pattern.

**Justification**:

- Separation of concerns: audit logic isolated from business logic
- Repository pattern enables testing with mocks
- Consistent audit entry format across all entities
- Transaction integration ensures audit trail integrity
- Can be extended to external audit systems without business code changes

## TN10

**Decision**: Use Angular Signals for state management.

**Justification**:

- Fine-grained reactivity reduces unnecessary change detection cycles
- Built into Angular v16+ without external dependencies (no NgRx needed)
- Simpler mental model than RxJS for local component state
- Computed signals enable derived state without manual subscription management
- Integrates cleanly with OnPush change detection strategy

## TN11

**Decision**: Use DTO validation with class-validator.

**Justification**:

- Decorator-based validation aligns with NestJS/TypeScript patterns
- Automatic validation pipes reduce boilerplate in controllers
- Transform decorators enable normalization (trim, lowercase) at API boundary
- Type safety ensures validated data matches expected structure
- OpenAPI integration provides automatic documentation

## TN12

**Decision**: Use environment-based configuration with validation.

**Justification**:

- Twelve-factor app compliance
- Validation at startup prevents runtime errors from missing config
- Type-safe configuration objects with defaults
- Caching prevents repeated validation overhead
- Separate configurations per environment (dev/staging/prod)

## TN13

**Decision**: Use repository pattern with TypeORM for database access.

**Justification**:

- Abstraction enables unit testing with mock repositories
- Query builder supports complex joins while maintaining type safety
- Raw SQL escape hatch available for performance-critical queries
- Transaction support for multi-step operations
- Consistent error handling across all data access

## TN14

**Decision**: Use breadcrumbs builder pattern for navigation.

**Justification**:

- Dynamic generation reflects current application state
- Context preservation through query parameters maintains filters
- Consistent hierarchy across all entity types
- Testable builder functions with clear inputs/outputs
- Can be extended for future entity types without global changes
