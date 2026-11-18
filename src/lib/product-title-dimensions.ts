/**
 * Split one unambiguous size out for display only. Values without axis labels
 * must include a length unit; this avoids treating product/model numbers as sizes.
 */
export function splitProductTitleDimensions(title: string): { displayTitle: string; dimensions?: string } {
  const value = String.raw`\d+(?:[.,]\d+)?`;
  const axesAfter = String.raw`${value}\s*W\s*[x×*]\s*${value}\s*D\s*[x×*]\s*${value}\s*H(?:\s*(?:mm|cm))?`;
  const axesBefore = String.raw`W\s*${value}\s*[x×*]\s*D\s*${value}\s*[x×*]\s*H\s*${value}(?:\s*(?:mm|cm))?`;
  const unitAtEnd = String.raw`${value}\s*[x×*]\s*${value}(?:\s*[x×*]\s*${value})?\s*(?:mm|cm)`;
  const pattern = new RegExp(String.raw`(?<![A-Za-z0-9.,])(?:${axesAfter}|${axesBefore}|${unitAtEnd})(?=$|[\s,，;；|/()（）\[\]–—-])`, 'gi');
  const matches = Array.from(title.matchAll(pattern));
  if (matches.length !== 1) return { displayTitle: title };

  const match = matches[0];
  const start = match.index!;
  let before = title.slice(0, start);
  let after = title.slice(start + match[0].length);
  // Drop parentheses only when they contain nothing other than the size.
  const brackets: Record<string, string> = { '(': ')', '（': '）', '[': ']' };
  const open = before.match(/([（(\[])\s*$/)?.[1];
  if (open && after.trimStart().startsWith(brackets[open])) {
    before = before.replace(/[（(\[]\s*$/, '');
    after = after.replace(/^\s*[）)\]]/, '');
  }
  const separator = before && after && (/\s$/.test(before) || /^\s/.test(after)) ? ' ' : '';
  const displayTitle = `${before.trimEnd()}${separator}${after.trimStart()}`.trim();
  if (!displayTitle) return { displayTitle: title };
  return { displayTitle, dimensions: match[0] };
}
