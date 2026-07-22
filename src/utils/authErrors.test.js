import getAuthErrorMessage from './authErrors';

describe('getAuthErrorMessage', () => {
  it('returns friendly message for invalid email', () => {
    expect(getAuthErrorMessage('auth/invalid-email')).toBe(
      'Please enter a valid email address.'
    );
  });

  it('returns friendly message for disabled user', () => {
    expect(getAuthErrorMessage('auth/user-disabled')).toBe(
      'This account has been disabled.'
    );
  });

  it('returns generic message for invalid credentials', () => {
    const message = getAuthErrorMessage('auth/invalid-credential');
    expect(message).toBe('Invalid email or password.');
  });

  it('returns generic message for user not found', () => {
    const message = getAuthErrorMessage('auth/user-not-found');
    expect(message).toBe('Invalid email or password.');
  });

  it('returns generic message for wrong password', () => {
    const message = getAuthErrorMessage('auth/wrong-password');
    expect(message).toBe('Invalid email or password.');
  });

  it('returns friendly message for too many requests', () => {
    expect(getAuthErrorMessage('auth/too-many-requests')).toBe(
      'Too many attempts. Please try again later.'
    );
  });

  it('returns generic fallback for unknown error codes', () => {
    expect(getAuthErrorMessage('auth/unknown-error')).toBe(
      'Something went wrong. Please try again.'
    );
    expect(getAuthErrorMessage('random-error')).toBe(
      'Something went wrong. Please try again.'
    );
  });

  it('returns generic fallback for empty or null', () => {
    expect(getAuthErrorMessage('')).toBe(
      'Something went wrong. Please try again.'
    );
    expect(getAuthErrorMessage(null)).toBe(
      'Something went wrong. Please try again.'
    );
  });
});
