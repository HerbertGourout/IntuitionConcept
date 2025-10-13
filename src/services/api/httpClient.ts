import { auth } from '../../firebase';

export interface ApiClientOptions {
  baseUrl?: string;
  getToken?: () => Promise<string | null>;
}

const DEFAULT_BASE_URL = import.meta.env.VITE_BACKEND_URL || '';

const getDefaultToken = async (): Promise<string | null> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return null;
  }

  try {
    return await currentUser.getIdToken();
  } catch (error) {
    console.error('Impossible de récupérer le token Firebase:', error);
    return null;
  }
};

export class HttpClient {
  private readonly baseUrl: string;
  private readonly getToken: () => Promise<string | null>;

  constructor(options?: ApiClientOptions) {
    this.baseUrl = options?.baseUrl ?? DEFAULT_BASE_URL;
    this.getToken = options?.getToken ?? getDefaultToken;
  }

  private async buildHeaders(customHeaders?: Record<string, string>): Promise<HeadersInit> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders
    };

    const token = await this.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private buildUrl(path: string): string {
    const trimmedBase = this.baseUrl.replace(/\/$/, '');
    const trimmedPath = path.startsWith('/') ? path : `/${path}`;
    return `${trimmedBase}${trimmedPath}`;
  }

  async get<T>(path: string, options?: { headers?: Record<string, string> }): Promise<T> {
    return this.request<T>('GET', path, undefined, options);
  }

  async post<T>(path: string, body?: unknown, options?: { headers?: Record<string, string> }): Promise<T> {
    return this.request<T>('POST', path, body, options);
  }

  async delete<T>(path: string, options?: { headers?: Record<string, string> }): Promise<T> {
    return this.request<T>('DELETE', path, undefined, options);
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'DELETE',
    path: string,
    body?: unknown,
    options?: { headers?: Record<string, string> },
    attempt: number = 0
  ): Promise<T> {
    const response = await fetch(this.buildUrl(path), {
      method,
      headers: await this.buildHeaders(options?.headers),
      body: body ? JSON.stringify(body) : undefined
    });

    if (response.status === 401 && attempt === 0 && auth.currentUser) {
      try {
        // Force refresh the Firebase ID token
        await auth.currentUser.getIdToken(true);
        return this.request<T>(method, path, body, options, attempt + 1);
      } catch {
        // fall through to error handling
      }
    }

    if (!response.ok) {
      throw await this.toError(response);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  private async toError(response: Response): Promise<Error> {
    let message = `${response.status} ${response.statusText}`;

    try {
      const payload = await response.json();
      if (payload?.message) {
        message = `${message} - ${payload.message}`;
      }
      if (payload?.details) {
        const details = typeof payload.details === 'string' ? payload.details : JSON.stringify(payload.details);
        message = `${message} (${details})`;
      }
    } catch {
      // ignore JSON parse errors
    }

    const error = new Error(message);
    (error as Error & { status?: number }).status = response.status;
    return error;
  }
}

export const apiClient = new HttpClient();
