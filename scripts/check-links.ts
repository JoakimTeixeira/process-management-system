import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { mapWithConcurrency } from "./bounded-concurrency.ts";

const repositoryRoot = process.cwd();
const excludedDirectories = new Set([
  ".agents",
  ".angular",
  ".claude",
  ".devin",
  ".diagnostics-fixtures",
  ".git",
  ".sonarqube",
  ".windsurf",
  "coverage",
  "dist",
  "node_modules",
]);
const externalSchemes = /^(?:https?:|mailto:|tel:)/i;
const ignoredSchemes = /^(?:data:|javascript:)/i;
const DEFAULT_EXTERNAL_CONCURRENCY = 8;

export interface ParsedArguments {
  external: boolean;
  targets: string[];
}

export interface MarkdownLinkReference {
  destination: string;
  line: number;
}

export interface LinkFailure {
  file: string;
  line: number;
  message: string;
}

export function parseArguments(
  arguments_: readonly string[],
  defaultRoot: string = repositoryRoot,
): ParsedArguments {
  const external = arguments_.includes("--external");
  const targets = arguments_.filter((argument) => argument !== "--external");
  return {
    external,
    targets: targets.length > 0 ? targets : [defaultRoot],
  };
}

export async function collectMarkdownFiles(
  targets: readonly string[],
  root: string = repositoryRoot,
): Promise<string[]> {
  const files: string[] = [];

  async function visit(target: string, explicit = false): Promise<void> {
    const absoluteTarget = path.resolve(root, target);
    let targetStat;

    try {
      targetStat = await stat(absoluteTarget);
    } catch {
      throw new Error(`Link-check target does not exist: ${target}`);
    }

    if (targetStat.isFile()) {
      if (path.extname(absoluteTarget).toLowerCase() === ".md") {
        files.push(absoluteTarget);
      }
      return;
    }

    const entries = await readdir(absoluteTarget, { withFileTypes: true });
    for (const entry of entries) {
      if (
        entry.isDirectory() &&
        !explicit &&
        excludedDirectories.has(entry.name)
      ) {
        continue;
      }
      if (entry.isDirectory() && excludedDirectories.has(entry.name)) {
        continue;
      }
      if (entry.isDirectory() || entry.name.toLowerCase().endsWith(".md")) {
        await visit(path.join(absoluteTarget, entry.name));
      }
    }
  }

  for (const target of targets) {
    await visit(target, true);
  }

  return [...new Set(files)].sort((left, right) => left.localeCompare(right));
}

export function stripHtmlTags(value: string): string {
  let result = "";
  let insideTag = false;

  for (const character of value) {
    if (character === "<") {
      insideTag = true;
    } else if (character === ">") {
      insideTag = false;
    } else if (!insideTag) {
      result += character;
    }
  }
  return result;
}

export function stripMarkdownLinks(value: string): string {
  let result = "";
  let cursor = 0;

  while (cursor < value.length) {
    const closeLabel = value.indexOf("](", cursor);
    if (closeLabel === -1) {
      return result + value.slice(cursor);
    }
    const openLabel = value.lastIndexOf("[", closeLabel);
    const closeDestination = value.indexOf(")", closeLabel + 2);
    if (openLabel === -1 || closeDestination === -1) {
      return result + value.slice(cursor);
    }
    const imageMarker = openLabel > cursor && value[openLabel - 1] === "!";
    const prefixEnd = imageMarker ? openLabel - 1 : openLabel;
    result += value.slice(cursor, prefixEnd);
    result += value.slice(openLabel + 1, closeLabel);
    cursor = closeDestination + 1;
  }

  return result;
}

export function markdownSlug(value: string): string {
  return stripMarkdownLinks(stripHtmlTags(value))
    .replace(/[`*_~]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N} _-]/gu, "")
    .replace(/\s/g, "-");
}

function isFence(line: string): boolean {
  const trimmed = line.trimStart();
  return trimmed.startsWith("```") || trimmed.startsWith("~~~");
}

function headingText(line: string): string | undefined {
  const trimmed = line.trimStart();
  let markerLength = 0;
  while (trimmed[markerLength] === "#" && markerLength < 6) {
    markerLength += 1;
  }
  if (markerLength === 0 || trimmed[markerLength] !== " ") {
    return undefined;
  }

  let heading = trimmed.slice(markerLength + 1).trimEnd();
  while (heading.endsWith("#")) {
    heading = heading.slice(0, -1).trimEnd();
  }
  return heading;
}

function tagAttributes(tag: string): Map<string, string> {
  const attributes = new Map<string, string>();
  let cursor = 0;

  while (cursor < tag.length) {
    while (cursor < tag.length && /\s/.test(tag[cursor])) {
      cursor += 1;
    }
    const nameStart = cursor;
    while (
      cursor < tag.length &&
      !/\s/.test(tag[cursor]) &&
      tag[cursor] !== "="
    ) {
      cursor += 1;
    }
    const name = tag.slice(nameStart, cursor).toLowerCase();
    while (cursor < tag.length && /\s/.test(tag[cursor])) {
      cursor += 1;
    }
    if (tag[cursor] !== "=") {
      continue;
    }
    cursor += 1;
    while (cursor < tag.length && /\s/.test(tag[cursor])) {
      cursor += 1;
    }
    const quote = tag[cursor];
    if (quote !== '"' && quote !== "'") {
      continue;
    }
    const valueStart = cursor + 1;
    const valueEnd = tag.indexOf(quote, valueStart);
    if (valueEnd === -1) {
      break;
    }
    attributes.set(name, tag.slice(valueStart, valueEnd));
    cursor = valueEnd + 1;
  }

  return attributes;
}

function collectHtmlAttributes(
  line: string,
  names: readonly string[],
): string[] {
  const values: string[] = [];
  let cursor = 0;

  while (cursor < line.length) {
    const tagStart = line.indexOf("<", cursor);
    if (tagStart === -1) {
      break;
    }
    const tagEnd = line.indexOf(">", tagStart + 1);
    if (tagEnd === -1) {
      break;
    }
    const attributes = tagAttributes(line.slice(tagStart + 1, tagEnd));
    for (const name of names) {
      const value = attributes.get(name);
      if (value !== undefined) {
        values.push(value);
      }
    }
    cursor = tagEnd + 1;
  }

  return values;
}

export function collectAnchors(markdown: string): Set<string> {
  const anchors = new Set<string>();
  const occurrences = new Map<string, number>();
  let fenced = false;

  for (const line of markdown.split(/\r?\n/)) {
    if (isFence(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) {
      continue;
    }

    const heading = headingText(line);
    if (heading !== undefined) {
      const base = markdownSlug(heading);
      const count = occurrences.get(base) ?? 0;
      anchors.add(count === 0 ? base : `${base}-${count}`);
      occurrences.set(base, count + 1);
    }

    for (const anchor of collectHtmlAttributes(line, ["id", "name"])) {
      anchors.add(anchor);
    }
  }

  return anchors;
}

export function normalizeDestination(rawDestination: string): string {
  let withoutTitle = rawDestination.trim();
  if (withoutTitle.startsWith("<") && withoutTitle.endsWith(">")) {
    withoutTitle = withoutTitle.slice(1, -1);
  }
  if (!withoutTitle.includes(" ")) {
    return withoutTitle;
  }

  let titleStart = -1;
  for (let index = 0; index < withoutTitle.length - 1; index += 1) {
    if (
      /\s/.test(withoutTitle[index]) &&
      ['"', "'", "("].includes(withoutTitle[index + 1])
    ) {
      titleStart = index;
      break;
    }
  }
  return titleStart === -1
    ? withoutTitle
    : withoutTitle.slice(0, titleStart).trim();
}

function maskInlineCode(line: string): string {
  const characters = [...line];
  let cursor = 0;

  while (cursor < line.length) {
    if (line[cursor] !== "`") {
      cursor += 1;
      continue;
    }
    let delimiterEnd = cursor;
    while (line[delimiterEnd] === "`") {
      delimiterEnd += 1;
    }
    const delimiter = line.slice(cursor, delimiterEnd);
    const closing = line.indexOf(delimiter, delimiterEnd);
    if (closing === -1) {
      break;
    }
    characters.fill(" ", cursor, closing + delimiter.length);
    cursor = closing + delimiter.length;
  }

  return characters.join("");
}

function parseDefinition(
  line: string,
): { label: string; destination: string } | undefined {
  const trimmed = line.trimStart();
  if (!trimmed.startsWith("[")) {
    return undefined;
  }
  const separator = trimmed.indexOf("]: ");
  const compactSeparator = trimmed.indexOf("]:");
  const definitionEnd = separator === -1 ? compactSeparator : separator;
  if (definitionEnd < 2) {
    return undefined;
  }
  const destination = trimmed.slice(definitionEnd + 2).trimStart();
  if (!destination) {
    return undefined;
  }
  return {
    label: trimmed.slice(1, definitionEnd).trim().toLowerCase(),
    destination: normalizeDestination(destination),
  };
}

function collectInlineMarkdownLinks(line: string): string[] {
  const destinations: string[] = [];
  let cursor = 0;

  while (cursor < line.length) {
    const closeLabel = line.indexOf("](", cursor);
    if (closeLabel === -1) {
      break;
    }
    const openLabel = line.lastIndexOf("[", closeLabel);
    const closeDestination = line.indexOf(")", closeLabel + 2);
    if (openLabel === -1 || closeDestination === -1) {
      break;
    }
    destinations.push(line.slice(closeLabel + 2, closeDestination));
    cursor = closeDestination + 1;
  }

  return destinations;
}

function collectReferenceLabels(line: string): string[] {
  const labels: string[] = [];
  let cursor = 0;

  while (cursor < line.length) {
    const separator = line.indexOf("][", cursor);
    if (separator === -1) {
      break;
    }
    const openLabel = line.lastIndexOf("[", separator);
    const closeReference = line.indexOf("]", separator + 2);
    if (openLabel === -1 || closeReference === -1) {
      break;
    }
    const label = line.slice(openLabel + 1, separator);
    const reference = line.slice(separator + 2, closeReference);
    labels.push((reference || label).trim().toLowerCase());
    cursor = closeReference + 1;
  }

  return labels;
}

export function collectLinks(markdown: string): MarkdownLinkReference[] {
  const links: MarkdownLinkReference[] = [];
  const definitions = new Map<string, { destination: string; line: number }>();
  const lines = markdown.split(/\r?\n/);
  let fenced = false;

  for (const [index, line] of lines.entries()) {
    if (isFence(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) {
      continue;
    }

    const searchableLine = maskInlineCode(line);

    const definition = parseDefinition(searchableLine);
    if (definition) {
      definitions.set(definition.label, {
        destination: definition.destination,
        line: index + 1,
      });
    }

    for (const destination of collectInlineMarkdownLinks(searchableLine)) {
      links.push({
        destination: normalizeDestination(destination),
        line: index + 1,
      });
    }

    for (const destination of collectHtmlAttributes(searchableLine, [
      "href",
      "src",
    ])) {
      links.push({ destination, line: index + 1 });
    }
  }

  for (const [index, line] of lines.entries()) {
    const searchableLine = maskInlineCode(line);
    if (parseDefinition(searchableLine)) {
      continue;
    }
    for (const label of collectReferenceLabels(searchableLine)) {
      const definition = definitions.get(label);
      if (definition) {
        links.push({ destination: definition.destination, line: index + 1 });
      } else {
        links.push({
          destination: `[missing reference: ${label}]`,
          line: index + 1,
        });
      }
    }
  }

  return links;
}

function splitDestination(destination: string): {
  pathname: string;
  anchor: string;
} {
  const hashIndex = destination.indexOf("#");
  if (hashIndex === -1) {
    return { pathname: destination, anchor: "" };
  }
  return {
    pathname: destination.slice(0, hashIndex),
    anchor: destination.slice(hashIndex + 1),
  };
}

export async function validateInternalLink(
  sourceFile: string,
  link: MarkdownLinkReference,
  anchorCache: Map<string, Set<string>>,
): Promise<string | undefined> {
  if (link.destination.startsWith("[missing reference:")) {
    return "has no matching reference definition";
  }

  const { pathname, anchor } = splitDestination(link.destination);
  let decodedPath: string;
  let decodedAnchor: string;
  try {
    decodedPath = decodeURIComponent(pathname);
    decodedAnchor = decodeURIComponent(anchor);
  } catch {
    return "contains invalid URL encoding";
  }

  const target = decodedPath
    ? path.resolve(path.dirname(sourceFile), decodedPath)
    : sourceFile;
  let targetStat;
  try {
    targetStat = await stat(target);
  } catch {
    return `targets missing path ${link.destination}`;
  }

  let anchorFile = target;
  if (targetStat.isDirectory()) {
    if (!decodedAnchor) {
      return undefined;
    }
    anchorFile = path.join(target, "README.md");
    try {
      await stat(anchorFile);
    } catch {
      return `targets a directory without README.md: ${link.destination}`;
    }
  }

  if (!decodedAnchor) {
    return undefined;
  }
  if (path.extname(anchorFile).toLowerCase() !== ".md") {
    return `uses an anchor on a non-Markdown target: ${link.destination}`;
  }

  let anchors = anchorCache.get(anchorFile);
  if (!anchors) {
    anchors = collectAnchors(await readFile(anchorFile, "utf8"));
    anchorCache.set(anchorFile, anchors);
  }
  if (!anchors.has(decodedAnchor.toLowerCase())) {
    return `targets missing anchor #${decodedAnchor}`;
  }

  return undefined;
}

export async function validateExternalLink(
  url: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string | undefined> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetchImpl(url, {
      headers: { "user-agent": "process-management-system-link-check/1.0" },
      redirect: "follow",
      signal: controller.signal,
    });
    await response.body?.cancel();
    if (response.ok || response.status === 401 || response.status === 403) {
      return undefined;
    }
    return `returned HTTP ${response.status}`;
  } catch (error) {
    return `could not be checked: ${error instanceof Error ? error.message : String(error)}`;
  } finally {
    clearTimeout(timeout);
  }
}

function relative(file: string, root: string = repositoryRoot): string {
  return path.relative(root, file).replaceAll(path.sep, "/");
}

export async function runLinkCheck({
  arguments_ = process.argv.slice(2),
  fetchImpl = fetch,
  logger = console,
  root = repositoryRoot,
  externalConcurrency = DEFAULT_EXTERNAL_CONCURRENCY,
}: {
  arguments_?: readonly string[];
  fetchImpl?: typeof fetch;
  logger?: { log: (message: string) => void; error: (message: string) => void };
  root?: string;
  externalConcurrency?: number;
} = {}): Promise<{ checkedFiles: number; failures: LinkFailure[] }> {
  const { external, targets } = parseArguments(arguments_, root);
  const files = await collectMarkdownFiles(targets, root);
  const anchorCache = new Map<string, Set<string>>();
  const failures: LinkFailure[] = [];
  const externalReferences = new Map<
    string,
    { file: string; line: number }[]
  >();

  for (const file of files) {
    const markdown = await readFile(file, "utf8");
    for (const link of collectLinks(markdown)) {
      if (ignoredSchemes.test(link.destination)) {
        continue;
      }
      if (externalSchemes.test(link.destination)) {
        if (external && /^https?:/i.test(link.destination)) {
          const references = externalReferences.get(link.destination) ?? [];
          references.push({ file, line: link.line });
          externalReferences.set(link.destination, references);
        }
        continue;
      }

      const message = await validateInternalLink(file, link, anchorCache);
      if (message) {
        failures.push({ file, line: link.line, message });
      }
    }
  }

  if (external) {
    const externalResults = await mapWithConcurrency(
      [...externalReferences],
      externalConcurrency,
      async ([url, references]) => ({
        message: await validateExternalLink(url, fetchImpl),
        references,
        url,
      }),
    );

    for (const { message, references, url } of externalResults) {
      if (message) {
        for (const reference of references) {
          failures.push({
            ...reference,
            message: `${url} ${message}`,
          });
        }
      }
    }
  }

  for (const failure of failures) {
    logger.error(
      `${relative(failure.file, root)}:${failure.line} [links] ${failure.message}`,
    );
  }

  if (failures.length > 0) {
    logger.error(`\n[links] ${failures.length} broken link(s) found.`);
    process.exitCode = 1;
    return { checkedFiles: files.length, failures };
  }

  const suffix = external ? "internal and external" : "internal";
  logger.log(
    `[links] Checked ${files.length} Markdown files; all ${suffix} links passed.`,
  );
  return { checkedFiles: files.length, failures };
}

if (path.basename(process.argv[1] ?? "") === "check-links.ts") {
  void runLinkCheck();
}

