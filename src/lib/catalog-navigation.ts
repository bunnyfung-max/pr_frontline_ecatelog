/** Replace the viewed content without changing the directory or search it came from. */
export function switchedContentUrl(search: string, contentId: string): string {
  const params = new URLSearchParams(search);
  params.set('content', contentId);
  return `/?${params.toString()}`;
}
