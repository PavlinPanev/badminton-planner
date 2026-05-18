import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.badmintonApiUrl;

export const badmintonApiUrl =
  typeof apiUrl === 'string' && apiUrl.length > 0 ? apiUrl.replace(/\/$/, '') : 'http://localhost:3000/api';

type ApiErrorBody = {
  error?: {
    message?: string;
  };
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
  }
}

export async function readApiError(response: Response) {
  const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
  return body?.error?.message ?? `Request failed with status ${response.status}.`;
}

export function apiEndpoint(path: string) {
  return `${badmintonApiUrl}${path.startsWith('/') ? path : `/${path}`}`;
}
