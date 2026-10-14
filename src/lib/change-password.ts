import { HttpError } from './http-error';

const MAX_PASSWORD_LENGTH = 500;
const MIN_NEW_PASSWORD_LENGTH = 8;

export function validatePasswordChange(input: {
  currentPassword?: unknown;
  newPassword?: unknown;
  confirmPassword?: unknown;
}) {
  const { currentPassword, newPassword, confirmPassword } = input;
  if (
    typeof currentPassword !== 'string' ||
    !currentPassword ||
    currentPassword.length > MAX_PASSWORD_LENGTH
  ) {
    throw new HttpError(400, '請輸入現有密碼。');
  }
  if (typeof newPassword !== 'string' || typeof confirmPassword !== 'string') {
    throw new HttpError(400, '請輸入新密碼。');
  }
  if (newPassword.length < MIN_NEW_PASSWORD_LENGTH || newPassword.length > MAX_PASSWORD_LENGTH) {
    throw new HttpError(400, '新密碼須為 8 至 500 個字元。');
  }
  if (newPassword !== confirmPassword) {
    throw new HttpError(400, '兩次輸入的新密碼不相同。');
  }
  if (newPassword === currentPassword) {
    throw new HttpError(400, '新密碼不可與現有密碼相同。');
  }
  return { currentPassword, newPassword };
}

export function passwordUpdateErrorMessage(message: string) {
  const lower = message.toLowerCase();
  if (
    lower.includes('at least') ||
    lower.includes('weak') ||
    lower.includes('pwned') ||
    lower.includes('leaked') ||
    lower.includes('strength')
  ) {
    return '新密碼強度不足，請使用至少 8 個字元，並避免常見密碼。';
  }
  if (lower.includes('same') || lower.includes('different from')) {
    return '新密碼不可與現有密碼相同。';
  }
  return '未能更新密碼，請稍後再試。';
}
