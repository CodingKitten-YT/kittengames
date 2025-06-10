/**
 * ROT13 encoding/decoding utilities - optimized version
 */

// Cache for encoded slugs to avoid re-computing
const encodingCache = new Map<string, string>();

/**
 * Encode a string using ROT13 cipher (optimized with caching)
 */
export function rot13Encode(str: string): string {
  if (encodingCache.has(str)) {
    return encodingCache.get(str)!;
  }
  
  const encoded = str.replace(/[a-z]/g, (char) => {
    return String.fromCharCode(((char.charCodeAt(0) - 97 + 13) % 26) + 97);
  });
  
  encodingCache.set(str, encoded);
  return encoded;
}

/**
 * Decode a ROT13 encoded string (same as encoding since ROT13 is symmetric)
 */
export function rot13Decode(str: string): string {
  return rot13Encode(str); // ROT13 is symmetric
}

/**
 * Create a ROT13 encoded slug for URL routing
 */
export function createEncodedGameSlug(gameName: string): string {
  const normalSlug = gameName.toLowerCase().replace(/\s+/g, "-");
  return rot13Encode(normalSlug);
}

/**
 * Decode a ROT13 encoded slug back to the original game slug
 */
export function decodeGameSlug(encodedSlug: string): string {
  return rot13Decode(encodedSlug);
}
