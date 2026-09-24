import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canUpdateFeedbackStatus,
  feedbackSubmitSchema,
  feedbackStatusUpdateSchema,
} from '../src/lib/feedback';

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

test('feedback status can only move from open to solved or future plan once', () => {
  assert.equal(canUpdateFeedbackStatus('open', 'solved'), true);
  assert.equal(canUpdateFeedbackStatus('open', 'future_plan'), true);
  assert.equal(canUpdateFeedbackStatus('open', 'open'), false);
  assert.equal(canUpdateFeedbackStatus('solved', 'future_plan'), false);
  assert.equal(canUpdateFeedbackStatus('future_plan', 'solved'), false);
  const result = feedbackStatusUpdateSchema.safeParse({
    id: '00000000-0000-4000-8000-000000000001',
    status: 'solved',
  });
  assert.equal(result.success, true);
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
