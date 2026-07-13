// Utilities for mocking Firebase Authentication in Playwright tests.
// The app signs in through the Firebase JS SDK, which talks to Google's
// identitytoolkit / securetoken REST APIs. We intercept those calls and
// return canned responses so tests never need real credentials or network.

export const TEST_USER = {
  localId: 'playwright-test-uid',
  email: 'testuser@example.com',
  password: 'password123',
};

// Firebase decodes the idToken payload, so it must be a structurally valid JWT.
const makeFakeJwt = () => {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: 'https://securetoken.google.com/mock-project',
    aud: 'mock-project',
    auth_time: now,
    user_id: TEST_USER.localId,
    sub: TEST_USER.localId,
    iat: now,
    exp: now + 3600,
    email: TEST_USER.email,
    email_verified: true,
    firebase: { identities: { email: [TEST_USER.email] }, sign_in_provider: 'password' },
  };
  const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  return `${encode(header)}.${encode(payload)}.fake-signature`;
};

/**
 * Intercept Firebase auth endpoints. Sign-in succeeds only for TEST_USER's
 * credentials; anything else gets INVALID_LOGIN_CREDENTIALS.
 */
export async function mockFirebaseAuth(page) {
  const idToken = makeFakeJwt();

  await page.route('**/identitytoolkit.googleapis.com/**', async (route) => {
    const url = route.request().url();

    if (url.includes('accounts:signInWithPassword')) {
      const body = route.request().postDataJSON() ?? {};
      const isValid = body.email === TEST_USER.email && body.password === TEST_USER.password;

      if (!isValid) {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: { code: 400, message: 'INVALID_LOGIN_CREDENTIALS', errors: [] },
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          kind: 'identitytoolkit#VerifyPasswordResponse',
          localId: TEST_USER.localId,
          email: TEST_USER.email,
          displayName: '',
          idToken,
          registered: true,
          refreshToken: 'fake-refresh-token',
          expiresIn: '3600',
        }),
      });
      return;
    }

    if (url.includes('accounts:lookup')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          kind: 'identitytoolkit#GetAccountInfoResponse',
          users: [
            {
              localId: TEST_USER.localId,
              email: TEST_USER.email,
              emailVerified: true,
              displayName: '',
              providerUserInfo: [
                { providerId: 'password', federatedId: TEST_USER.email, email: TEST_USER.email, rawId: TEST_USER.email },
              ],
              validSince: '0',
              lastLoginAt: String(Date.now()),
              createdAt: String(Date.now()),
            },
          ],
        }),
      });
      return;
    }

    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });

  await page.route('**/securetoken.googleapis.com/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: idToken,
        expires_in: '3600',
        token_type: 'Bearer',
        refresh_token: 'fake-refresh-token',
        id_token: idToken,
        user_id: TEST_USER.localId,
        project_id: 'mock-project',
      }),
    });
  });
}

/**
 * Mock auth, then log in through the real UI. Lands on the To-Do page ('/').
 */
export async function loginAsTestUser(page) {
  await mockFirebaseAuth(page);
  await page.goto('/login');
  await page.getByPlaceholder('Enter your email').fill(TEST_USER.email);
  await page.getByPlaceholder('Enter your password').fill(TEST_USER.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL('/');
}
