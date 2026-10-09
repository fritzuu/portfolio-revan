export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

function imageType(bytes) {
  if (
    bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    return 'png';
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'jpg';
  if (['GIF87a', 'GIF89a'].includes(bytes.subarray(0, 6).toString()))
    return 'gif';
  if (
    bytes.subarray(0, 4).toString() === 'RIFF' &&
    bytes.subarray(8, 12).toString() === 'WEBP'
  )
    return 'webp';
  return null;
}

export function validateImage(image) {
  if (
    typeof image !== 'string' ||
    !image.length ||
    image.length > Math.ceil(MAX_IMAGE_BYTES / 3) * 4 ||
    image.length % 4 !== 0 ||
    !/^[A-Za-z0-9+/]*={0,2}$/.test(image)
  )
    return false;
  const bytes = Buffer.from(image, 'base64');
  return (
    bytes.toString('base64') === image &&
    bytes.length <= MAX_IMAGE_BYTES &&
    Boolean(imageType(bytes))
  );
}

export function createImageUploader({
  key = process.env.IMGBB_API_KEY,
  fetchImpl = fetch,
} = {}) {
  if (!key) return null;
  return async (image) => {
    const form = new FormData();
    form.set('key', key);
    form.set('image', image);
    // No expiration: images remain available until removed in ImgBB.
    const response = await fetchImpl('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(30000),
    });
    const result = await response.json();
    const url = new URL(result?.data?.url);
    if (
      !response.ok ||
      !result.success ||
      url.protocol !== 'https:' ||
      url.hostname !== 'i.ibb.co'
    )
      throw new Error('Image upload failed.');
    return { url: url.href };
  };
}
