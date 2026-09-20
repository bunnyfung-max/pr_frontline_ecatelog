import test from 'node:test';
import assert from 'node:assert/strict';
import { feedbackSubmitSchema } from '../src/lib/feedback';

test('feedback submit schema accepts valid payload', () => {
  const result = feedbackSubmitSchema.safeParse({
    name: 'Alice',
    category: 'bug',
    description: 'Search result missing product chip.',
    priority: 'high',
    attachments: ['feedback:user/abc.png'],
  });
  assert.equal(result.success, true);
});

test('feedback submit schema rejects empty description', () => {
  const result = feedbackSubmitSchema.safeParse({
    name: 'Alice',
    category: 'optimization',
    description: '   ',
    priority: 'low',
    attachments: [],
  });
  assert.equal(result.success, false);
});

test('feedback submit schema limits attachments', () => {
  const result = feedbackSubmitSchema.safeParse({
    name: 'Alice',
    category: 'bug',
    description: 'Too many files',
    priority: 'medium',
    attachments: Array.from({ length: 6 }, (_, i) => `feedback:user/${i}.png`),
  });
  assert.equal(result.success, false);
});
