import type { MetadataRoute } from 'next';

const BLOCKED_AGENTS = [
  '*',
  'Googlebot',
  'Googlebot-Image',
  'Googlebot-News',
  'Googlebot-Video',
  'Bingbot',
  'Slurp',
  'DuckDuckBot',
  'Baiduspider',
  'YandexBot',
  'Sogou',
  'Exabot',
  'facebot',
  'ia_archiver',
  'Applebot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: BLOCKED_AGENTS.map((userAgent) => ({
      userAgent,
      disallow: '/',
    })),
  };
}
