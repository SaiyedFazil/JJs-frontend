const mockGet = jest.fn();
const mockPatch = jest.fn();
jest.mock('../src/lib/api/api-client', () => ({
  __esModule: true,
  default: {
    get: (...args: unknown[]) => mockGet(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
  },
}));

import { userApi } from '../src/lib/api/user/user-api';

const wire = {
  id: 7,
  first_name: 'Asha',
  last_name: 'Rao',
  email: null,
  country_code: '+91',
  phone_number: '9999999999',
};

const app = {
  id: 7,
  firstName: 'Asha',
  lastName: 'Rao',
  email: null,
  countryCode: '+91',
  phoneNumber: '9999999999',
};

beforeEach(() => {
  mockGet.mockReset();
  mockPatch.mockReset();
});

it('getProfile maps the snake_case payload to UserProfile', async () => {
  mockGet.mockResolvedValue({ data: { success: true, data: wire } });
  await expect(userApi.getProfile()).resolves.toEqual(app);
  expect(mockGet).toHaveBeenCalledWith('/user/profile');
});

it('refuses a success:false body with the server message', async () => {
  mockGet.mockResolvedValue({
    data: { success: false, message: 'Nope', data: wire },
  });
  await expect(userApi.getProfile()).rejects.toThrow('Nope');
});

it('refuses a success:false body with a default message', async () => {
  mockGet.mockResolvedValue({ data: { success: false, data: wire } });
  await expect(userApi.getProfile()).rejects.toThrow('Profile request failed');
});

it('updateProfile PATCHes the payload verbatim and returns the server copy', async () => {
  mockPatch.mockResolvedValue({
    data: { success: true, data: { ...wire, first_name: 'Asha K' } },
  });
  await expect(
    userApi.updateProfile({ first_name: 'Asha', last_name: 'Rao' }),
  ).resolves.toEqual({ ...app, firstName: 'Asha K' });
  expect(mockPatch).toHaveBeenCalledWith('/user/profile', {
    first_name: 'Asha',
    last_name: 'Rao',
  });
});
