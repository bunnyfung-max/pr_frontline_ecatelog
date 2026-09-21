import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PurchaseLinks, ContentShoppingLinks, StorePurchaseLink } from '../src/components/shopping-links';
import { initialCatalog } from '../src/lib/seed';
import { schemas } from '../src/lib/validation';

test('product saves distinct links and preserves legacy eShop URL', () => {
  const product = initialCatalog(true).products[0];
  const legacy = schemas.product.parse({ ...product, url: 'https://example.com/sofa' });
  assert.equal(legacy.url, 'https://example.com/sofa');
  assert.equal(legacy.storeUrl, '');
  const saved = schemas.product.parse({ ...legacy, storeUrl: 'https://example.com/store/sofa' });
  assert.equal(saved.storeUrl, 'https://example.com/store/sofa');
  assert.equal(saved.url, legacy.url);
});

test('content accepts independent kit links, old records and clearing links', () => {
  const content = initialCatalog(true).contents.find((item) => item.id === 'kit-a')!;
  const legacy = schemas.content.parse(content);
  assert.equal(legacy.storeUrl, '');
  assert.equal(legacy.eshopUrl, '');
  const saved = schemas.content.parse({
    ...content,
    storeUrl: 'https://example.com/store/kit',
    eshopUrl: 'https://example.com/kit',
  });
  assert.equal(saved.storeUrl, 'https://example.com/store/kit');
  assert.equal(saved.eshopUrl, 'https://example.com/kit');
  const cleared = schemas.content.parse({ ...saved, storeUrl: '', eshopUrl: '' });
  assert.equal(cleared.storeUrl, '');
  assert.equal(cleared.eshopUrl, '');
});

test('API schemas reject unsafe links in each product and kit field', () => {
  const data = initialCatalog(true);
  for (const invalid of [
    'javascript:alert(1)',
    'data:text/html,bad',
    'http://example.com',
    '//example.com',
    'not a URL',
  ]) {
    for (const field of ['storeUrl', 'url'])
      assert.equal(
        schemas.product.safeParse({ ...data.products[0], [field]: invalid }).success,
        false,
      );
    for (const field of ['storeUrl', 'eshopUrl'])
      assert.equal(
        schemas.content.safeParse({ ...data.contents.find((item) => item.id === 'kit-a')!, [field]: invalid }).success,
        false,
      );
  }
});

test('viewer shows content links, tags and cached eShop products without unrelated product cards', () => {
  const data = initialCatalog(true);
  const content = {
    ...data.contents.find((item) => item.id === 'kit-a')!,
    storeUrl: 'https://example.com/store/kit',
    eshopUrl: 'https://example.com/eshop/kit',
    tags: ['米白色', '梳化'],
    productIds: [],
  };
  data.products[0] = {
    ...data.products[0],
    storeUrl: 'https://example.com/store/sofa',
    url: 'https://example.com/eshop/sofa',
  };
  const html = renderToStaticMarkup(
    createElement(ContentShoppingLinks, { content, products: data.products }),
  );
  assert.ok(html.includes(`href="${content.storeUrl}"`));
  assert.equal(html.includes(`href="${content.eshopUrl}"`), false);
  assert.equal((html.match(/<a /g) || []).length, 3);
  assert.ok(html.includes('米白色'));
  assert.ok(html.includes('梳化'));
  assert.ok(html.includes('eShop 產品'));
  assert.ok(html.includes('RIVO 雙趟門三櫃桶衣櫃'));
  assert.equal(html.includes('https://example.com/store/sofa'), false);
});

test('missing kit links still show tags and never borrow legacy shared settings', () => {
  const data = initialCatalog(true);
  data.settings.url = 'https://example.com/obsolete-global';
  const html = renderToStaticMarkup(
    createElement(ContentShoppingLinks, {
      content: data.contents.find((item) => item.id === 'kit-a')!,
      products: data.products,
    }),
  );
  const kitSection = html.split('</section>')[0];
  assert.ok(kitSection.includes('自在購連結待設定'));
  assert.equal(kitSection.includes('href='), false);
  assert.ok(html.includes('米白色'));
  assert.equal(html.includes('obsolete-global'), false);
});

test('renderer hides unsafe legacy destinations and only shows configured buttons', () => {
  const unsafe = renderToStaticMarkup(
    createElement(PurchaseLinks, {
      storeUrl: 'javascript:alert(1)',
      eshopUrl: 'http://example.com',
    }),
  );
  assert.equal(unsafe.includes('href='), false);
  assert.ok(unsafe.includes('購物連結待設定'));
  const one = renderToStaticMarkup(
    createElement(PurchaseLinks, { storeUrl: 'https://example.com/sofa' }),
  );
  assert.equal((one.match(/<a /g) || []).length, 1);
  assert.ok(one.includes('前往自在購'));
  assert.equal(one.includes('前往 eShop'), false);
});

test('store purchase link only shows 自在購 button', () => {
  const html = renderToStaticMarkup(
    createElement(StorePurchaseLink, { storeUrl: 'https://example.com/store/kit' }),
  );
  assert.ok(html.includes('前往自在購'));
  assert.equal(html.includes('前往 eShop'), false);
});
