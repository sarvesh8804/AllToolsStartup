/** URL component and full-string encoding helpers. */

export function encodeUrlComponent(input: string): string {
  return encodeURIComponent(input);
}

export function decodeUrlComponent(input: string): string {
  return decodeURIComponent(input);
}

export function encodeUrl(input: string): string {
  return encodeURI(input);
}

export function decodeUrl(input: string): string {
  return decodeURI(input);
}
