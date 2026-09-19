export const makeId = () => crypto.randomUUID();

export function normalizeTag(raw: string) {
  return raw.trim().normalize('NFKC');
}
