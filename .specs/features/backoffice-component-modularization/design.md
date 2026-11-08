# Backoffice Component Modularization Design

**Spec:** `.specs/features/backoffice-component-modularization/spec.md`  
**Status:** Approved

## Method

1. Add missing characterization specs before moving markup or styles.
2. For each production component, copy the inline template and style text byte-for-byte into
   same-basename `.html` and `.scss` files.
3. Replace inline metadata with same-basename `templateUrl` and `styleUrl` entries.
4. Keep selectors, imports, encapsulation, inputs, outputs, and class code unchanged.
5. Verify each component with its focused spec, then verify the complete application.

Components without existing styles receive an intentionally empty companion SCSS file; the file is
an ownership seam, not an invitation to invent styling. Existing `styleUrls` metadata is normalized
to the singular Angular `styleUrl` form used by the public application.

## Structural invariant

For every non-spec TypeScript file under `web/backoffice/src/app` that declares `@Component`, the
same basename must have `.html`, `.scss`, and `.spec.ts` files. Production component metadata must
contain `templateUrl` and `styleUrl` and must not contain inline `template` or `styles` properties.

## Failure controls

- Characterization assertions are not weakened during extraction.
- A component extraction stops if its focused spec fails.
- The final task fails on any ESLint warning, TypeScript error, missing companion, or inline
  production template/style.
