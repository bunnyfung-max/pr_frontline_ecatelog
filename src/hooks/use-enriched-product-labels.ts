'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Catalog, Content, EshopProductLink } from '@/lib/types';
import {
  contentLinkedProductLabels,
  formatEshopProductLabel,
  formatLegacyProductLabel,
} from '@/lib/linked-product-display';
import { api } from '@/lib/client';

function labelsForContent(
  data: Catalog,
  content: Content,
  liveByUrl: Map<string, EshopProductLink>,
) {
  const labels: string[] = [];
  for (const link of content.eshopProducts ?? []) {
    const live = liveByUrl.get(link.url);
    labels.push(
      formatEshopProductLabel(
        live?.title
          ? {
              ...link,
              title: live.title,
              brand: live.brand || link.brand,
              description: live.description || link.description,
            }
          : link,
      ),
    );
  }
  for (const product of data.products.filter((item) => content.productIds.includes(item.id))) {
    labels.push(formatLegacyProductLabel(product));
  }
  return [...new Set(labels.map((label) => label.trim()).filter(Boolean))];
}

export function useEnrichedProductLabels(data: Catalog, contents: Content[]) {
  const urlKey = useMemo(
    () =>
      [...new Set(contents.flatMap((content) => (content.eshopProducts ?? []).map((link) => link.url)))]
        .sort()
        .join('\0'),
    [contents],
  );
  const [liveByUrl, setLiveByUrl] = useState<Map<string, EshopProductLink>>(() => new Map());

  useEffect(() => {
    const urls = urlKey ? urlKey.split('\0') : [];
    if (!urls.length) {
      setLiveByUrl(new Map());
      return;
    }
    let active = true;
    const params = new URLSearchParams();
    for (const url of urls) params.append('url', url);
    api<{ products: EshopProductLink[] }>(`/api/eshop-product?${params}`)
      .then((response) => {
        if (!active) return;
        setLiveByUrl(new Map(response.products.map((product) => [product.url, product])));
      })
      .catch(() => {
        if (active) setLiveByUrl(new Map());
      });
    return () => {
      active = false;
    };
  }, [urlKey]);

  return useMemo(() => {
    const map = new Map<string, string[]>();
    for (const content of contents) {
      map.set(
        content.id,
        liveByUrl.size
          ? labelsForContent(data, content, liveByUrl)
          : contentLinkedProductLabels(data, content),
      );
    }
    return map;
  }, [contents, data, liveByUrl]);
}
