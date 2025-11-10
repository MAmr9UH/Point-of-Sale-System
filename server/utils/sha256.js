export async function sha256hash(message) {
  // message: string | ArrayBuffer | Uint8Array
  const encoder = new TextEncoder();
  const data = (typeof message === 'string') ? encoder.encode(message) : message;
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}