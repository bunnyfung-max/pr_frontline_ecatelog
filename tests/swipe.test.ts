import assert from 'node:assert/strict';
import test from 'node:test';
import { swipeDirection } from '../src/lib/swipe';

test('left swipe turns to the next page and right swipe to the previous page', () => {
  assert.equal(swipeDirection(-120, 10, 200), 'next');
  assert.equal(swipeDirection(120, -10, 200), 'previous');
});

test('short, slow, or mostly vertical gestures do not turn the page', () => {
  assert.equal(swipeDirection(-30, 0, 150), null);
  assert.equal(swipeDirection(-200, 0, 1200), null);
  assert.equal(swipeDirection(-80, 70, 200), null);
  assert.equal(swipeDirection(0, -300, 200), null);
});
