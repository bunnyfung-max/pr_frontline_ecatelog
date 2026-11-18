import test from 'node:test';
import assert from 'node:assert/strict';
import { splitProductTitleDimensions } from '../src/lib/product-title-dimensions';

test('splits labelled sizes without losing the colour after them', () => {
  assert.deepEqual(splitProductTitleDimensions('雙人床1219W x 1874D x 1050Hmm 胡桃木色'), {
    displayTitle: '雙人床 胡桃木色', dimensions: '1219W x 1874D x 1050Hmm',
  });
  assert.deepEqual(splitProductTitleDimensions('餐桌 W120 x D60 x H75 cm 白色'), {
    displayTitle: '餐桌 白色', dimensions: 'W120 x D60 x H75 cm',
  });
});

test('splits two or three unlabelled numbers only with explicit units', () => {
  assert.deepEqual(splitProductTitleDimensions('地毯 (160 × 200 cm) 米色'), {
    displayTitle: '地毯 米色', dimensions: '160 × 200 cm',
  });
  assert.deepEqual(splitProductTitleDimensions('櫃 120x60x80cm 白色'), {
    displayTitle: '櫃 白色', dimensions: '120x60x80cm',
  });
});

test('does not treat model codes or ambiguous sizes as one dimension', () => {
  for (const title of [
    'TR825-P 120x60 模型', 'TR120x60cm 產品',
    '櫃 120x60cm 或 150x70cm', '120x60cm',
  ]) assert.deepEqual(splitProductTitleDimensions(title), { displayTitle: title });
});
