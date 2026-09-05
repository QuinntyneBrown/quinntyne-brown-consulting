/**
 * The rules the server applies to an upload, mirrored so an obvious refusal is shown at once
 * rather than after a round trip. The server stays the authority: anything that passes here is
 * still checked there, and the wording is kept identical so a reader sees one message either way.
 *
 * @see backend/src/Qbc.Workboard.Application/Features/Attachments/Commands/UploadAttachmentCommand.cs
 */
export const MAXIMUM_ATTACHMENT_BYTES = 25 * 1024 * 1024;

const BLOCKED_EXTENSIONS: ReadonlySet<string> = new Set([
  'exe',
  'bat',
  'cmd',
  'com',
  'msi',
  'scr',
  'sh',
  'ps1',
  'dll',
  'jar',
]);

export function extensionOf(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  return dot > 0 ? fileName.slice(dot + 1).toLowerCase() : '';
}

/** The reason a file would be refused, or null when there is none to give before sending it. */
export function refusalFor(file: File): string | null {
  if (file.name.trim().length === 0) return 'A file is required.';
  // A dropped folder arrives as a File with no bytes and no type; so does a genuinely empty file.
  if (file.size === 0) return 'The file is empty, or is a folder. Folders have to be zipped first.';
  if (file.size > MAXIMUM_ATTACHMENT_BYTES) return 'The file is over the 25 MB limit.';
  if (BLOCKED_EXTENSIONS.has(extensionOf(file.name))) {
    return 'Programs and scripts cannot be attached.';
  }
  return null;
}

export type FileKind = 'pdf' | 'doc' | 'sheet' | 'slides' | 'image' | 'archive' | 'code' | 'file';

const KIND_BY_EXTENSION: Readonly<Record<string, FileKind>> = {
  pdf: 'pdf',
  doc: 'doc',
  docx: 'doc',
  rtf: 'doc',
  txt: 'doc',
  md: 'doc',
  odt: 'doc',
  xls: 'sheet',
  xlsx: 'sheet',
  csv: 'sheet',
  tsv: 'sheet',
  ods: 'sheet',
  numbers: 'sheet',
  ppt: 'slides',
  pptx: 'slides',
  key: 'slides',
  odp: 'slides',
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  gif: 'image',
  webp: 'image',
  svg: 'image',
  heic: 'image',
  bmp: 'image',
  zip: 'archive',
  '7z': 'archive',
  tar: 'archive',
  gz: 'archive',
  rar: 'archive',
  json: 'code',
  xml: 'code',
  yaml: 'code',
  yml: 'code',
  html: 'code',
  css: 'code',
  ts: 'code',
  js: 'code',
  cs: 'code',
  py: 'code',
  sql: 'code',
};

/** The family a file belongs to, read from its name first and its declared type second. */
export function kindOf(fileName: string, contentType = ''): FileKind {
  const byExtension = KIND_BY_EXTENSION[extensionOf(fileName)];
  if (byExtension) return byExtension;
  if (contentType.startsWith('image/')) return 'image';
  if (contentType === 'application/pdf') return 'pdf';
  if (contentType.startsWith('text/')) return 'doc';
  return 'file';
}

/** The badge text: the extension when it is short enough to read at a glance, else the family. */
export function badgeOf(fileName: string, contentType = ''): string {
  const extension = extensionOf(fileName);
  if (extension.length > 0 && extension.length <= 4) return extension.toUpperCase();
  const kind = kindOf(fileName, contentType);
  return kind === 'file' ? 'FILE' : kind.toUpperCase().slice(0, 4);
}

/** Whole kilobytes, and one decimal once a file is measured in megabytes. */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
