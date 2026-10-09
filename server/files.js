import { randomUUID } from 'node:crypto';
export const MAX_FILE_BYTES = 2 * 1024 * 1024;
export const ASSET_BUCKET = 'portfolio-files';
export function validatePdf(file) {
  if (
    typeof file !== 'string' ||
    file.length > Math.ceil(MAX_FILE_BYTES / 3) * 4 ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(file)
  )
    return false;
  const bytes = Buffer.from(file, 'base64');
  return (
    bytes.toString('base64') === file &&
    bytes.length <= MAX_FILE_BYTES &&
    bytes.subarray(0, 5).toString() === '%PDF-' &&
    bytes.subarray(-1024).toString().includes('%%EOF')
  );
}
export function createFileUploader({
  url = process.env.SUPABASE_URL,
  key = process.env.SUPABASE_SECRET_KEY,
  fetchImpl = fetch,
} = {}) {
  if (!url || !key) return null;
  const origin = new URL(url.trim());
  const headers = { apikey: key.trim(), Authorization: `Bearer ${key.trim()}` };
  return async (file) => {
    const name = `${randomUUID()}.pdf`;
    const response = await fetchImpl(
      new URL(`/storage/v1/object/${ASSET_BUCKET}/${name}`, origin),
      {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/pdf',
          'x-upsert': 'false',
        },
        body: Buffer.from(file, 'base64'),
        signal: AbortSignal.timeout(30000),
      },
    );
    if (!response.ok) throw new Error('File upload failed.');
    return {
      url: new URL(`/storage/v1/object/public/${ASSET_BUCKET}/${name}`, origin)
        .href,
    };
  };
}
