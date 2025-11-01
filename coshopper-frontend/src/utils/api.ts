/* Simple API client for CoShopper frontend */

export type AccessTokens = {
  access: string;
  refresh: string;
};

const BASE_URL = 'http://localhost:8000/api/v1';
const ACCESS_KEY = 'coshopper_access_token';
const REFRESH_KEY = 'coshopper_refresh_token';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(tokens: AccessTokens) {
  localStorage.setItem(ACCESS_KEY, tokens.access);
  localStorage.setItem(REFRESH_KEY, tokens.refresh);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem('coshopper_public_user_name');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const access = getAccessToken();
  if (access) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${access}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // if unauthorized and we have refresh token, try refresh once
  if (res.status === 401) {
    const refreshed = await tryRefreshTokens();
    if (refreshed) {
      const retryHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        Authorization: `Bearer ${getAccessToken()}`,
      };
      const retryRes = await fetch(`${BASE_URL}${path}`, { ...options, headers: retryHeaders });
      if (!retryRes.ok) {
        const err = await safeJson(retryRes);
        throw new Error(err?.error || retryRes.statusText);
      }
      return (await retryRes.json()) as T;
    }
  }

  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.error || res.statusText);
  }
  return (await res.json()) as T;
}

async function safeJson(res: Response): Promise<any | null> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function tryRefreshTokens(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  try {
    const res = await fetch(`${BASE_URL}/token/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as AccessTokens;
    setTokens(data);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

// API wrappers

export async function register(name: string, email: string, password: string, country: string): Promise<AccessTokens> {
  const data = await request<AccessTokens>('/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, country }),
  });
  setTokens(data);
  return data;
}

export async function login(email: string, password: string): Promise<AccessTokens> {
  const data = await request<AccessTokens>('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setTokens(data);
  return data;
}

export type UserType = {
  _id: string;
  name: string;
  email: string;
  country: string;
  createdAt: string;
  updatedAt: string;
};

export type CurrentUser = UserType;

export async function getCurrentUser(): Promise<CurrentUser> {
  return await request<CurrentUser>('/user', { method: 'GET' });
}

export type CreatedList = {
  _id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  ownerId?: string | null;
  ownerName?: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function createList(name: string, description: string, isPublic: boolean): Promise<CreatedList> {
  return await request<CreatedList>('/list', {
    method: 'POST',
    body: JSON.stringify({ name, description, isPublic }),
  });
}

export function isLoggedIn(): boolean {
  return Boolean(getAccessToken());
}

// List detail with items and dynamic columns
export type Collaborator = {
  userId: string;
  userName: string;
  userEmail?: string;
  permissions: string[];
};

export type AdditionalColumn = {
  name: string;
  type: string;
};

export type ListItem = {
  _id: string;
  listId: string;
  name: string;
  qty: number;
  unit?: string;
  whoBrings: Array<{ userId?: string; userName: string; qty: number | string }>;
  [key: string]: any;
};

export type ListType = {
  _id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  ownerId?: string | null;
  ownerName?: string | null;
  collaborators: Collaborator[];
  additionalColumns: AdditionalColumn[];
  createdAt: string;
  updatedAt: string;
};

export type ListDetail = ListType & {
  items: ListItem[];
};

export async function getList(listId: string): Promise<ListDetail> {
  return await request<ListDetail>(`/list/${listId}`, { method: 'GET' });
}

export async function updateListDescription(listId: string, description: string): Promise<{ message: string }> {
  return await request<{ message: string }>(`/list/${listId}/description`, {
    method: 'PUT',
    body: JSON.stringify({ description }),
  });
}

// Find collaborator by email
export async function findCollaboratorByEmail(email: string): Promise<{ collaboratorName: string | null }> {
  return await request<{ collaboratorName: string | null }>('/find-collaborator-by-email', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function addCollaborator(
  listId: string, 
  email: string, 
  permissions: string[], 
  collaboratorName?: string
): Promise<{ message: string }> {
  const body: any = { email, permissions };
  if (collaboratorName) {
    body.collaboratorName = collaboratorName;
  }
  return await request<{ message: string }>(`/list/${listId}/collaborators`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateCollaboratorPermissions(listId: string, collaboratorUserId: string, permissions: string[]): Promise<{ message: string }> {
  return await request<{ message: string }>(`/list/${listId}/collaborators/${collaboratorUserId}`, {
    method: 'PUT',
    body: JSON.stringify({ permissions }),
  });
}

export async function removeCollaborator(listId: string, collaboratorUserId: string): Promise<{ message: string }> {
  return await request<{ message: string }>(`/list/${listId}/collaborators/${collaboratorUserId}`, {
    method: 'DELETE',
  });
}

export async function addAdditionalColumnApi(listId: string, name: string, type: string): Promise<{ message: string }> {
  return await request<{ message: string }>(`/list/${listId}/additional-columns`, {
    method: 'POST',
    body: JSON.stringify({ name, type }),
  });
}

export async function removeAdditionalColumnApi(listId: string, columnName: string): Promise<{ message: string }> {
  return await request<{ message: string }>(`/list/${listId}/additional-columns/${encodeURIComponent(columnName)}`, {
    method: 'DELETE',
  });
}

export async function addListItemApi(listId: string, payload: any): Promise<{ message: string }> {
  return await request<{ message: string }>(`/list/${listId}/item`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateListItemApi(listId: string, itemId: string, updateKey: string, value: any): Promise<{ message: string }> {
  return await request<{ message: string }>(`/list/${listId}/item/${itemId}/${encodeURIComponent(updateKey)}`, {
    method: 'PUT',
    body: JSON.stringify({ value }),
  });
}

export async function deleteListItemApi(listId: string, itemId: string): Promise<{ message: string }> {
  return await request<{ message: string }>(`/list/${listId}/item/${itemId}`, {
    method: 'DELETE',
  });
}

// Get lists owned by user
export async function getUserLists(): Promise<ListType[]> {
  return await request<ListType[]>('/lists', { method: 'GET' });
}

// Get lists where user is collaborator
export async function getCollaboratingLists(): Promise<ListType[]> {
  return await request<ListType[]>('/collaborating-lists', { method: 'GET' });
}

// Update user name
export async function updateUserName(name: string): Promise<{ message: string }> {
  return await request<{ message: string }>('/user/name', {
    method: 'PUT',
    body: JSON.stringify({ name }),
  });
}

// Update user country
export async function updateUserCountry(country: string): Promise<{ message: string }> {
  return await request<{ message: string }>('/user/country', {
    method: 'PUT',
    body: JSON.stringify({ country }),
  });
}

