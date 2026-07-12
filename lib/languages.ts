// Shared between the paste form (client) and the API routes (server).

export const LANGUAGES = [
  { value: 'plaintext', label: 'Plain Text', ext: 'txt' },
  { value: 'bash', label: 'Bash / Shell', ext: 'sh' },
  { value: 'c', label: 'C', ext: 'c' },
  { value: 'cpp', label: 'C++', ext: 'cpp' },
  { value: 'csharp', label: 'C#', ext: 'cs' },
  { value: 'css', label: 'CSS', ext: 'css' },
  { value: 'go', label: 'Go', ext: 'go' },
  { value: 'java', label: 'Java', ext: 'java' },
  { value: 'javascript', label: 'JavaScript', ext: 'js' },
  { value: 'json', label: 'JSON', ext: 'json' },
  { value: 'kotlin', label: 'Kotlin', ext: 'kt' },
  { value: 'markdown', label: 'Markdown', ext: 'md' },
  { value: 'php', label: 'PHP', ext: 'php' },
  { value: 'python', label: 'Python', ext: 'py' },
  { value: 'ruby', label: 'Ruby', ext: 'rb' },
  { value: 'rust', label: 'Rust', ext: 'rs' },
  { value: 'sql', label: 'SQL', ext: 'sql' },
  { value: 'swift', label: 'Swift', ext: 'swift' },
  { value: 'typescript', label: 'TypeScript', ext: 'ts' },
  { value: 'xml', label: 'HTML / XML', ext: 'html' },
  { value: 'yaml', label: 'YAML', ext: 'yml' },
] as const;

export type Language = (typeof LANGUAGES)[number]['value'];

export function isValidLanguage(value: unknown): value is Language {
  return typeof value === 'string' && LANGUAGES.some((l) => l.value === value);
}

export function languageLabel(value: string | null | undefined): string {
  return LANGUAGES.find((l) => l.value === value)?.label ?? 'Plain Text';
}

export function languageExt(value: string | null | undefined): string {
  return LANGUAGES.find((l) => l.value === value)?.ext ?? 'txt';
}

// Expiry choices. `modifier` is only ever interpolated into SQL after a
// whitelist lookup here, never from raw user input.
export const EXPIRY_OPTIONS = [
  { value: '10m', label: '10 minutes', modifier: '+10 minutes' },
  { value: '1h', label: '1 hour', modifier: '+1 hour' },
  { value: '1d', label: '1 day', modifier: '+1 day' },
  { value: '1w', label: '1 week', modifier: '+7 days' },
  { value: '15d', label: '15 days', modifier: '+15 days' },
] as const;

export type ExpiryValue = (typeof EXPIRY_OPTIONS)[number]['value'];

export const DEFAULT_EXPIRY: ExpiryValue = '15d';

export function expiryModifier(value: unknown): string {
  const opt = EXPIRY_OPTIONS.find((o) => o.value === value);
  return (opt ?? EXPIRY_OPTIONS.find((o) => o.value === DEFAULT_EXPIRY)!).modifier;
}
