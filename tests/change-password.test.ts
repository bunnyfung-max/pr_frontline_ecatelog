import test from 'node:test';
import assert from 'node:assert/strict';
import { HttpError } from '../src/lib/http-error';
import { passwordUpdateErrorMessage, validatePasswordChange } from '../src/lib/change-password';

test('accepts a new password that differs from the current one', () => {
  assert.deepEqual(
    validatePasswordChange({
      currentPassword: 'OldPass#1',
      newPassword: 'NewPass#2',
      confirmPassword: 'NewPass#2',
    }),
    { currentPassword: 'OldPass#1', newPassword: 'NewPass#2' },
  );
});

test('rejects mismatched, short, or unchanged passwords', () => {
  assert.throws(
    () =>
      validatePasswordChange({
        currentPassword: 'OldPass#1',
        newPassword: 'NewPass#2',
        confirmPassword: 'NewPass#3',
      }),
    (error: unknown) => error instanceof HttpError && error.message === '兩次輸入的新密碼不相同。',
  );
  assert.throws(
    () =>
      validatePasswordChange({
        currentPassword: 'OldPass#1',
        newPassword: 'short',
        confirmPassword: 'short',
      }),
    (error: unknown) => error instanceof HttpError && error.message === '新密碼須為 8 至 500 個字元。',
  );
  assert.throws(
    () =>
      validatePasswordChange({
        currentPassword: 'SamePass#1',
        newPassword: 'SamePass#1',
        confirmPassword: 'SamePass#1',
      }),
    (error: unknown) => error instanceof HttpError && error.message === '新密碼不可與現有密碼相同。',
  );
});

test('maps supplier password errors to a fixed message', () => {
  assert.equal(
    passwordUpdateErrorMessage('Password should be at least 6 characters'),
    '新密碼強度不足，請使用至少 8 個字元，並避免常見密碼。',
  );
  assert.equal(passwordUpdateErrorMessage('unexpected'), '未能更新密碼，請稍後再試。');
});
