export const base64UrlEncode = (buffer: ArrayBuffer | string): string => {
  const actualBuffer = typeof buffer === 'string' ? Buffer.from(buffer, 'utf-8') : Buffer.from(buffer);
  return actualBuffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};
