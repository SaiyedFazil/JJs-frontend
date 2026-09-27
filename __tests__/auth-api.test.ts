const mockPost = jest.fn();
jest.mock('../src/lib/api/api-client', () => ({
  __esModule: true,
  default: { post: (...args: unknown[]) => mockPost(...args) },
}));

import { authApi } from '../src/lib/api/auth/auth-api';

const body = { status: true, data: { authToken: 'next' } };

beforeEach(() => {
  mockPost.mockReset();
  mockPost.mockResolvedValue({ data: body });
});

it('sendOtp posts snake_case phone fields and returns the body', async () => {
  await expect(authApi.sendOtp('+91', '9999999999')).resolves.toEqual(body);
  expect(mockPost).toHaveBeenCalledWith('/user/auth/create', {
    country_code: '+91',
    phone_number: '9999999999',
  });
});

it('verifyOtp sends the pre-verify token as the bearer', async () => {
  await authApi.verifyOtp('123456', 'pre');
  expect(mockPost).toHaveBeenCalledWith(
    '/user/auth/verify-otp',
    { otp: '123456' },
    { headers: { Authorization: 'Bearer pre' } },
  );
});

it('resendOtp sends the pre-verify token as the bearer', async () => {
  await authApi.resendOtp('pre');
  expect(mockPost).toHaveBeenCalledWith(
    '/user/auth/resend-otp',
    {},
    { headers: { Authorization: 'Bearer pre' } },
  );
});

it('logout posts an empty body', async () => {
  await authApi.logout();
  expect(mockPost).toHaveBeenCalledWith('/user/auth/logout', {});
});
