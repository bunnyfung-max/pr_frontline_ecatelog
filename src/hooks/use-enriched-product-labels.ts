'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Catalog, Content, EshopProductLink } from '@/lib/types';
import { contentLinkedProductLabelsForQuery } from '@/lib/linked-product-display';
import { fetchLiveEshopProducts } from '@/lib/eshop-product-client';

function resolveLink(liveByUrl: Map<string, EshopProductLink>, link: EshopProductLink) {
  const live = liveByUrl.get(link.url);
  if (!live?.title) return link;
  return {
    ...link,
    title: live.title,
    brand: live.brand || link.brand,
    description: live.description || link.description,
  };
}

export function useEnrichedProductLabels(
  data: Catalog,
  contents: Content[],
  searchQuery = '',
) {
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
    const products = urls.map((url) => ({
      url,
      title: '',
      brand: '',
      sku: '',
      description: '',
      image: '',
      fetchedAt: '',
    }));
    void fetchLiveEshopProducts(products)
      .then((response) => {
        if (!active) return;
        setLiveByUrl(new Map(response.map((product) => [product.url, product])));
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
        contentLinkedProductLabelsForQuery(
          data,
          content,
          searchQuery,
          (link) => resolveLink(liveByUrl, link),
        ),
      );
    }
    return map;
  }, [contents, data.products, liveByUrl, searchQuery]);
}
